import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  ChevronRight,
  Clock,
  Compass,
  PlayCircle,
  Shuffle,
  Target,
  Timer,
  type LucideIcon,
} from "lucide-react";
import { getCurrentUser } from "@/lib/currentUser";
import { hasFeature, isPro, limitsFor } from "@/lib/plan";
import { getRecommendation } from "@/server/queries/history";
import { getRoadmap, type RoadmapMajor } from "@/server/queries/roadmap";
import { listStudyLessonSlugs, getStudyLesson } from "@/server/queries/study";

export const dynamic = "force-dynamic";

export const metadata = { title: "Home" };

const MAJOR_META: Record<
  string,
  { hue: string; hueDim: string; label: string }
> = {
  strategy: {
    hue: "#FF375F",
    hueDim: "rgba(255,55,95,0.10)",
    label: "Strategy",
  },
  management: {
    hue: "#FF9500",
    hueDim: "rgba(255,149,0,0.10)",
    label: "Management",
  },
  technology: {
    hue: "#0A84FF",
    hueDim: "rgba(10,132,255,0.10)",
    label: "Technology",
  },
};

/**
 * Home — composed like Apple Music's Listen Now: a quiet editorial header,
 * one featured "Reading Now" piece, a "Where you stand" anchor card, a
 * slim atlas of the syllabus, then a small Practice Room. The page reads
 * top-to-bottom as a magazine, not a dashboard.
 */
export default async function HomePage() {
  const user = await getCurrentUser();
  const pro = isPro(user);
  const canMock = hasFeature(user, "mockExam");
  const dailyLimit = limitsFor(user.plan).dailyQuestionAttempts;

  const [rec, roadmap, studySlugs] = await Promise.all([
    getRecommendation(user.id),
    getRoadmap(user.id),
    listStudyLessonSlugs(),
  ]);

  const studyLessons = (
    await Promise.all(studySlugs.slice(0, 6).map((s) => getStudyLesson(s)))
  ).filter((l): l is NonNullable<typeof l> => l !== null);

  // Feature pick: prefer the lesson that matches the recommended topic;
  // fall back to the first authored lesson so the page is never empty.
  const featured =
    (rec && studyLessons.find((l) => l.slug === rec.slug)) ??
    studyLessons[0] ??
    null;
  const otherLessons = featured
    ? studyLessons.filter((l) => l.slug !== featured.slug).slice(0, 4)
    : studyLessons.slice(0, 4);

  const lessonForRec =
    rec && studyLessons.find((l) => l.slug === rec.slug) ? rec.slug : null;

  const firstName = user.displayName?.split(" ")[0] ?? null;
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const dateStr = `${jst.getUTCFullYear()}年${jst.getUTCMonth() + 1}月${jst.getUTCDate()}日 (${["日", "月", "火", "水", "木", "金", "土"][jst.getUTCDay()]})`;
  const greeting = greetingFor(jst.getUTCHours());

  return (
    <div className="space-y-16 pb-16">
      {/* ── Editorial header ───────────────────────────────────────
         Date + greeting + name. No big section title — the page itself
         is the title. Apple Music's Listen Now feels like this. */}
      <header className="space-y-1.5 pt-1">
        <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          <span aria-hidden className="inline-block h-1 w-6 rounded-full bg-foreground/70" />
          {dateStr}
        </div>
        <h1 className="font-serif text-[34px] font-semibold leading-[1.06] tracking-[-0.022em] text-balance sm:text-[40px]">
          {greeting}
          {firstName ? (
            <>
              <span className="text-muted-foreground/70">、</span>
              {firstName}さん
            </>
          ) : (
            ""
          )}
          。
        </h1>
        <p className="max-w-[52ch] text-[14px] leading-relaxed text-muted-foreground text-pretty">
          今日は、読むことから始めましょう。
          {!pro && Number.isFinite(dailyLimit) && (
            <> ── 演習の無料枠は {dailyLimit as number} 問です。</>
          )}
        </p>
      </header>

      {/* ── Reading Now ─────────────────────────────────────────────
         Promoted as the protagonist. A single editorial card with the
         featured lesson, plus a horizontal row of more reading. */}
      {featured && (
        <Editorial
          eyebrow="Reading Now"
          flair="Today's Feature"
          rightHref="/learn/study"
          rightLabel="Browse all"
        >
          <FeaturedLesson
            slug={featured.slug}
            title={featured.title}
            dek={featured.dek ?? null}
            hook={featured.hook}
            readingMinutes={featured.readingMinutes}
            questionCount={featured.questionCount}
          />
          {otherLessons.length > 0 && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {otherLessons.map((l) => (
                <ReadingRow
                  key={l.slug}
                  slug={l.slug}
                  title={l.title}
                  hook={l.hook}
                  readingMinutes={l.readingMinutes}
                />
              ))}
            </div>
          )}
        </Editorial>
      )}

      {/* ── Where You Stand ─────────────────────────────────────────
         A single anchored card. Quiet by design — the lesson above is
         the lead. */}
      {rec && (
        <Editorial eyebrow="Where You Stand" flair="Picked for You">
          <CurrentSpot rec={rec} hasLesson={lessonForRec !== null} />
        </Editorial>
      )}

      {/* ── The Atlas ──────────────────────────────────────────────
         The whole syllabus in three strips. Replaces the literal
         "学習地図" label with an editorial name. */}
      <Editorial
        eyebrow="The Atlas"
        flair="A view of the syllabus"
        rightHref="/topics"
        rightLabel="Open atlas"
      >
        <div className="space-y-2">
          {roadmap.map((m) => (
            <ChapterStrip key={m.major} major={m} />
          ))}
        </div>
      </Editorial>

      {/* ── Practice Room ──────────────────────────────────────────
         Subordinate to reading. Three modes, no hierarchy hero. */}
      <Editorial eyebrow="Practice Room" flair="When you are ready">
        <div className="grid gap-3 sm:grid-cols-3">
          <ModeTile
            href="/learn/random"
            grad="bg-grad-purple"
            icon={Shuffle}
            kicker="Shuffle"
            title="気分転換に1問"
            sub="全範囲から抽選"
          />
          <ModeTile
            href="/learn/session/new?mode=weakness&count=5"
            grad="bg-grad-sunset"
            icon={Target}
            kicker="Tune-Up"
            title="弱点を5問で詰める"
            sub="誤解パターンで重み付け"
          />
          <ModeTile
            href={canMock ? "/learn/mock-exam" : "/pricing?reason=mock_exam"}
            grad="bg-grad-ocean"
            icon={Timer}
            kicker="Studio Live"
            title="本番形式の模擬試験"
            sub={canMock ? "100問 / 120分" : "Pro で開放"}
            locked={!canMock}
          />
        </div>
      </Editorial>

      {/* ── Insights ── single quiet link. ── */}
      <Link
        href="/dashboard"
        className="surface-card flex items-center gap-4 p-5"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <BarChart3 className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Insights
          </div>
          <div className="mt-0.5 font-serif text-[18px] font-semibold leading-tight tracking-tight">
            進捗を眺める
          </div>
          <div className="text-[12px] text-muted-foreground">
            正答率・連続記録・誤解パターンの傾向
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </Link>
    </div>
  );
}

// ── Editorial scaffolding ────────────────────────────────────────────────

function Editorial({
  eyebrow,
  flair,
  rightHref,
  rightLabel,
  children,
}: {
  eyebrow: string;
  flair?: string;
  rightHref?: string;
  rightLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-3 px-1">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            <span aria-hidden className="inline-block h-1 w-6 rounded-full bg-foreground/60" />
            {eyebrow}
          </div>
          {flair && (
            <div className="mt-2 font-serif text-[22px] font-semibold leading-tight tracking-[-0.018em]">
              {flair}
            </div>
          )}
        </div>
        {rightHref && rightLabel && (
          <Link
            href={rightHref}
            className="inline-flex shrink-0 items-center gap-1 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
          >
            {rightLabel}
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

// ── Pieces ───────────────────────────────────────────────────────────────

function FeaturedLesson({
  slug,
  title,
  dek,
  hook,
  readingMinutes,
  questionCount,
}: {
  slug: string;
  title: string;
  dek: string | null;
  hook: string;
  readingMinutes: number;
  questionCount: number;
}) {
  return (
    <Link
      href={`/learn/study/${slug}`}
      className="editorial-card group relative block overflow-hidden p-7 sm:p-9"
    >
      <div className="relative z-10 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            <span aria-hidden className="h-1 w-6 rounded-full bg-foreground/70" />
            {dek ?? "Today's Reading"}
          </div>
          <h2 className="font-serif text-[30px] font-semibold leading-[1.08] tracking-[-0.02em] text-balance sm:text-[40px]">
            {title}
          </h2>
          <p className="max-w-[58ch] text-[14.5px] leading-[1.75] text-muted-foreground text-pretty">
            {hook}
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-[11.5px] uppercase tracking-[0.16em] text-muted-foreground">
            <span>
              <span className="num font-semibold text-foreground">
                {readingMinutes}
              </span>{" "}
              min read
            </span>
            <span aria-hidden className="text-border">
              ·
            </span>
            <span>
              followed by{" "}
              <span className="num font-semibold text-foreground">
                {questionCount}
              </span>{" "}
              questions
            </span>
          </div>
          <div className="pt-3">
            <span className="inline-flex h-11 items-center gap-1.5 rounded-full bg-foreground px-5 text-[14px] font-semibold text-background shadow-ios transition-transform group-hover:brightness-110 group-active:scale-[0.98]">
              読みはじめる
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </div>
        <div
          aria-hidden
          className="pointer-events-none hidden h-[160px] w-[160px] shrink-0 items-center justify-center sm:flex"
        >
          <div className="relative grid place-items-center">
            <span className="absolute inset-[-18px] rounded-full bg-grad-sunset opacity-40 blur-3xl" />
            <span className="relative flex h-[140px] w-[140px] items-center justify-center rounded-3xl bg-grad-ink text-white shadow-hero">
              <span className="font-serif text-[64px] font-semibold leading-none tracking-[-0.04em]">
                ¶
              </span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ReadingRow({
  slug,
  title,
  hook,
  readingMinutes,
}: {
  slug: string;
  title: string;
  hook: string;
  readingMinutes: number;
}) {
  return (
    <Link
      href={`/learn/study/${slug}`}
      className="surface-card group flex h-full flex-col gap-2 p-5"
    >
      <div className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        Reading
      </div>
      <div className="font-serif text-[18px] font-semibold leading-snug tracking-[-0.014em]">
        {title}
      </div>
      <p className="line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground text-pretty">
        {hook}
      </p>
      <div className="mt-auto flex items-center gap-2 pt-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span className="num">{readingMinutes}</span> min
        <span aria-hidden className="ml-auto inline-flex items-center gap-1 normal-case tracking-normal text-muted-foreground/70">
          続きを読む
          <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

function ChapterStrip({ major }: { major: RoadmapMajor }) {
  const meta = MAJOR_META[major.major] ?? {
    hue: "#8E8E93",
    hueDim: "rgba(142,142,147,0.10)",
    label: major.label,
  };
  const pct =
    major.topicCount > 0
      ? Math.round((major.masteredCount / major.topicCount) * 100)
      : 0;
  return (
    <Link
      href={`/guides/${major.major}`}
      className="surface-card flex items-stretch gap-4 p-4"
    >
      <span
        aria-hidden
        className="w-[3px] shrink-0 rounded-full"
        style={{ background: meta.hue }}
      />
      <div className="min-w-0 flex-1">
        <div
          className="text-[10.5px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: meta.hue }}
        >
          {meta.label}
        </div>
        <div className="mt-0.5 font-serif text-[18px] font-semibold leading-tight tracking-[-0.014em]">
          {major.label}
        </div>
        <div className="text-[12px] text-muted-foreground">
          {major.minors.length} minor topics · {major.topicCount} essays
        </div>
        <div
          className="mt-2.5 h-[3px] overflow-hidden rounded-full"
          style={{ background: meta.hueDim }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.max(2, pct)}%`,
              background: meta.hue,
            }}
          />
        </div>
      </div>
      <div className="flex flex-col items-end justify-between text-right">
        <div className="num font-serif text-[22px] font-semibold leading-none tracking-[-0.02em]">
          {pct}
          <span className="ml-0.5 text-[11px] font-medium text-muted-foreground">
            %
          </span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </Link>
  );
}

function CurrentSpot({
  rec,
  hasLesson,
}: {
  rec: {
    slug: string;
    title: string;
    reason: string;
    attempted: number;
    correctRate: number;
  };
  hasLesson: boolean;
}) {
  const ratePct = rec.attempted > 0 ? Math.round(rec.correctRate * 100) : null;
  return (
    <article className="surface-card relative overflow-hidden p-6 sm:p-7">
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-foreground text-background shadow-tile">
          <Compass className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {rec.reason}
          </div>
          <h3 className="font-serif text-[22px] font-semibold leading-tight tracking-[-0.016em] text-balance sm:text-[26px]">
            {rec.title}
          </h3>
          <p className="text-[13px] leading-relaxed text-muted-foreground text-pretty">
            {rec.attempted > 0 ? (
              <>
                これまで{" "}
                <span className="num font-semibold text-foreground">
                  {rec.attempted}
                </span>
                問 ・ 正答率{" "}
                <span className="num font-semibold text-foreground">
                  {ratePct}%
                </span>
                。次の一歩を、ここから。
              </>
            ) : (
              "まだ手をつけていない論点。最初の一冊から始めましょう。"
            )}
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-3">
            {hasLesson && (
              <Link
                href={`/learn/study/${rec.slug}`}
                className="inline-flex h-10 items-center gap-1.5 rounded-full bg-foreground px-4 text-[13px] font-semibold text-background shadow-ios hover:brightness-110 active:scale-[0.98]"
              >
                記事を読む
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            )}
            <Link
              href={`/learn/session/new?mode=topic&topic=${rec.slug}&count=5`}
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-muted px-4 text-[13px] font-semibold text-foreground hover:bg-muted/70 active:scale-[0.98]"
            >
              <PlayCircle className="h-3.5 w-3.5" />
              関連問題で復習
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function ModeTile({
  href,
  grad,
  icon: Icon,
  kicker,
  title,
  sub,
  locked,
}: {
  href: string;
  grad: string;
  icon: LucideIcon;
  kicker: string;
  title: string;
  sub: string;
  locked?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`relative flex aspect-[4/3] flex-col justify-between overflow-hidden rounded-3xl ${grad} p-4 text-white shadow-hero transition-transform active:scale-[0.97]`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(120% 80% at 100% 0%, rgba(255,255,255,0.22), transparent 55%), radial-gradient(100% 80% at 0% 100%, rgba(0,0,0,0.20), transparent 50%)",
        }}
      />
      <div className="relative z-10 flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/25 backdrop-blur">
          <Icon className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] opacity-85">
          {locked ? "Pro" : kicker}
        </span>
      </div>
      <div className="relative z-10">
        <div className="font-serif text-[18px] font-semibold leading-tight tracking-[-0.014em]">
          {title}
        </div>
        <div className="text-[11.5px] opacity-85">{sub}</div>
      </div>
    </Link>
  );
}

function greetingFor(h: number) {
  if (h < 5) return "深い夜にようこそ";
  if (h < 11) return "おはようございます";
  if (h < 17) return "こんにちは";
  if (h < 21) return "こんばんは";
  return "夜、おつかれさまです";
}

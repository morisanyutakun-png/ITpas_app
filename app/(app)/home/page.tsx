import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
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
import { listTopics } from "@/server/queries/topics";
import { LessonThumbnail } from "@/components/study/Thumbnail";
import type { StudyFigure } from "@/lib/contentSchema";

export const dynamic = "force-dynamic";

export const metadata = { title: "ホーム" };

const MAJOR_META: Record<
  string,
  { hue: string; hueDim: string; label: string }
> = {
  strategy: {
    hue: "#FF375F",
    hueDim: "rgba(255,55,95,0.10)",
    label: "ストラテジ系",
  },
  management: {
    hue: "#FF9500",
    hueDim: "rgba(255,149,0,0.10)",
    label: "マネジメント系",
  },
  technology: {
    hue: "#0A84FF",
    hueDim: "rgba(10,132,255,0.10)",
    label: "テクノロジ系",
  },
};

/**
 * Home — a study platform front page. Section heads use plain Japanese
 * verbs (学ぶ / 問題を解く / 進捗) so beginners immediately know where
 * each section leads. The featured lesson sits at the top because the
 * input flow is the lead, but the visual styling stays warm and
 * textbook-like rather than editorial.
 */
export default async function HomePage() {
  const user = await getCurrentUser();
  const pro = isPro(user);
  const canMock = hasFeature(user, "mockExam");
  const dailyLimit = limitsFor(user.plan).dailyQuestionAttempts;

  const [rec, roadmap, studySlugs, allTopics] = await Promise.all([
    getRecommendation(user.id),
    getRoadmap(user.id),
    listStudyLessonSlugs(),
    listTopics(),
  ]);
  const topicBySlug = new Map(allTopics.map((t) => [t.slug, t]));

  const studyLessons = (
    await Promise.all(studySlugs.slice(0, 6).map((s) => getStudyLesson(s)))
  ).filter((l): l is NonNullable<typeof l> => l !== null);

  const hueOf = (slug: string): string => {
    const t = topicBySlug.get(slug);
    if (!t) return "#0A84FF";
    return MAJOR_META[t.majorCategory]?.hue ?? "#0A84FF";
  };

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
    <div className="space-y-12 pb-12">
      {/* ── Header ── */}
      <header className="space-y-1.5 pt-1">
        <div className="text-[12px] text-muted-foreground">{dateStr}</div>
        <h1 className="text-[26px] font-semibold leading-tight tracking-tight sm:text-[30px]">
          {greeting}
          {firstName ? `、${firstName}さん` : ""}。
        </h1>
        <p className="max-w-[52ch] text-[13.5px] leading-relaxed text-muted-foreground">
          {!pro && Number.isFinite(dailyLimit) ? (
            <>今日の学習を始めましょう。問題演習の無料枠は {dailyLimit as number} 問です。</>
          ) : (
            <>今日の学習を始めましょう。</>
          )}
        </p>
      </header>

      {/* ── 今日のおすすめ記事 ─────────────────────────
         Featured lesson — the input flow is the lead. */}
      {featured && (
        <Section
          title="今日のおすすめ記事"
          sub="まずは読んで、理解してから問題に進みましょう"
          rightHref="/learn/study"
          rightLabel="記事一覧"
        >
          <FeaturedLesson
            slug={featured.slug}
            title={featured.title}
            dek={featured.dek ?? null}
            hook={featured.hook}
            readingMinutes={featured.readingMinutes}
            questionCount={featured.questionCount}
            figureKind={featured.figure.kind}
            hue={hueOf(featured.slug)}
          />
          {otherLessons.length > 0 && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {otherLessons.map((l) => (
                <ReadingRow
                  key={l.slug}
                  slug={l.slug}
                  title={l.title}
                  hook={l.hook}
                  readingMinutes={l.readingMinutes}
                  dek={l.dek ?? null}
                  figureKind={l.figure.kind}
                  hue={hueOf(l.slug)}
                />
              ))}
            </div>
          )}
        </Section>
      )}

      {/* ── 次に学ぶ論点 (現在地) ── */}
      {rec && (
        <Section title="次に学ぶ論点" sub="あなたのこれまでの結果から選びました">
          <CurrentSpot rec={rec} hasLesson={lessonForRec !== null} />
        </Section>
      )}

      {/* ── 全体の地図 ── */}
      <Section
        title="ITパスポートの全体像"
        sub="分野を選ぶと、カリキュラム (記事 → 練習問題) に進めます"
      >
        <div className="space-y-2">
          {roadmap.map((m) => (
            <ChapterStrip key={m.major} major={m} />
          ))}
        </div>
      </Section>

      {/* ── 問題を解く ── */}
      <Section title="問題を解く" sub="読んだ後の力試しに">
        <div className="grid gap-3 sm:grid-cols-3">
          <ModeTile
            href="/learn/random"
            grad="bg-grad-purple"
            icon={Shuffle}
            kicker="ランダム"
            title="気分転換に1問"
            sub="全範囲から抽選"
          />
          <ModeTile
            href="/learn/session/new?mode=weakness&count=5"
            grad="bg-grad-sunset"
            icon={Target}
            kicker="弱点補強"
            title="弱点を5問で詰める"
            sub="誤解パターンで重み付け"
          />
          <ModeTile
            href={canMock ? "/learn/mock-exam" : "/pricing?reason=mock_exam"}
            grad="bg-grad-ocean"
            icon={Timer}
            kicker={canMock ? "模擬試験" : "Pro"}
            title="本番形式で力試し"
            sub={canMock ? "100問 / 120分" : "Pro で開放"}
            locked={!canMock}
          />
        </div>
      </Section>

      {/* ── 進捗 ── */}
      <Link
        href="/dashboard"
        className="surface-card flex items-center gap-4 p-5"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-grad-blue text-white shadow-tile">
          <BarChart3 className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[16px] font-semibold tracking-tight">
            進捗を確認する
          </div>
          <div className="mt-0.5 text-[12.5px] text-muted-foreground">
            正答率・連続記録・誤解パターンの傾向
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </Link>
    </div>
  );
}

// ── Section header ──────────────────────────────────────────────────────

function Section({
  title,
  sub,
  rightHref,
  rightLabel,
  children,
}: {
  title: string;
  sub?: string;
  rightHref?: string;
  rightLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3 px-1">
        <div className="min-w-0">
          <h2 className="text-[18px] font-semibold tracking-tight sm:text-[20px]">
            {title}
          </h2>
          {sub && (
            <p className="mt-0.5 text-[12.5px] text-muted-foreground text-pretty">
              {sub}
            </p>
          )}
        </div>
        {rightHref && rightLabel && (
          <Link
            href={rightHref}
            className="inline-flex shrink-0 items-center gap-0.5 text-[12.5px] font-medium text-muted-foreground hover:text-foreground"
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

// ── Pieces ──────────────────────────────────────────────────────────────

function FeaturedLesson({
  slug,
  title,
  dek,
  hook,
  readingMinutes,
  questionCount,
  figureKind,
  hue,
}: {
  slug: string;
  title: string;
  dek: string | null;
  hook: string;
  readingMinutes: number;
  questionCount: number;
  figureKind: StudyFigure["kind"];
  hue: string;
}) {
  return (
    <Link
      href={`/learn/study/${slug}`}
      className="surface-card group relative block overflow-hidden p-0"
    >
      <div className="grid gap-0 sm:grid-cols-[1fr_220px]">
        <div className="space-y-3 p-6 sm:p-7">
          {dek && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{ background: `${hue}14`, color: hue }}
            >
              <BookOpen className="h-3 w-3" />
              {dek}
            </span>
          )}
          <h3 className="text-[22px] font-semibold leading-snug tracking-tight text-balance sm:text-[26px]">
            {title}
          </h3>
          <p className="max-w-[58ch] text-[14px] leading-[1.8] text-muted-foreground text-pretty">
            {hook}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[12px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              読了の目安{" "}
              <span className="num font-semibold text-foreground">
                {readingMinutes}
              </span>{" "}
              分
            </span>
            <span aria-hidden className="text-border">
              ·
            </span>
            <span>
              読み終えたら関連問題{" "}
              <span className="num font-semibold text-foreground">
                {questionCount}
              </span>{" "}
              問
            </span>
          </div>
          <div className="pt-2">
            <span className="inline-flex h-11 items-center gap-1.5 rounded-full bg-foreground px-5 text-[14px] font-semibold text-background shadow-ios transition-transform group-hover:brightness-110 group-active:scale-[0.98]">
              この記事を読む
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
        <div
          aria-hidden
          className="hidden h-full overflow-hidden sm:block"
        >
          <LessonThumbnail
            hue={hue}
            figureKind={figureKind}
            ariaLabel={`${title} のサムネイル`}
            className="h-full w-full"
          />
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
  dek,
  figureKind,
  hue,
}: {
  slug: string;
  title: string;
  hook: string;
  readingMinutes: number;
  dek: string | null;
  figureKind: StudyFigure["kind"];
  hue: string;
}) {
  return (
    <Link
      href={`/learn/study/${slug}`}
      className="surface-card group flex h-full flex-col overflow-hidden p-0"
    >
      <div className="aspect-[16/9] w-full overflow-hidden">
        <LessonThumbnail
          hue={hue}
          figureKind={figureKind}
          ariaLabel={`${title} のサムネイル`}
          className="h-full w-full"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        {dek && (
          <span
            className="inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
            style={{ background: `${hue}14`, color: hue }}
          >
            <BookOpen className="h-3 w-3" />
            {dek}
          </span>
        )}
        <div className="text-[16px] font-semibold leading-snug tracking-tight">
          {title}
        </div>
        <p className="line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground text-pretty">
          {hook}
        </p>
        <div className="mt-auto flex items-center gap-2 pt-2 text-[11.5px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>
            <span className="num font-semibold text-foreground">
              {readingMinutes}
            </span>{" "}
            分で読める
          </span>
          <span aria-hidden className="ml-auto inline-flex items-center gap-1 text-muted-foreground/70">
            <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
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
      href={`/curriculum/${major.major}`}
      className="surface-card group flex items-stretch gap-4 p-4"
    >
      <span
        aria-hidden
        className="w-1 shrink-0 rounded-full"
        style={{ background: meta.hue }}
      />
      <div className="min-w-0 flex-1">
        <div className="text-[16px] font-semibold tracking-tight">
          {major.label}
        </div>
        <div className="text-[12px] text-muted-foreground">
          中項目 {major.minors.length} · 論点 {major.topicCount}
        </div>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full"
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
      <div className="flex flex-col items-end justify-between gap-1 text-right">
        <div className="num text-[20px] font-semibold leading-none tracking-tight">
          {pct}
          <span className="ml-0.5 text-[11px] font-medium text-muted-foreground">
            %
          </span>
        </div>
        <span className="inline-flex items-center gap-0.5 text-[10.5px] font-semibold text-muted-foreground group-hover:text-foreground">
          カリキュラム
          <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </span>
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
    <article className="surface-card relative overflow-hidden p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-foreground text-background shadow-tile">
          <Compass className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[11.5px] font-semibold text-muted-foreground">
            {rec.reason}
          </div>
          <h3 className="mt-1 text-[18px] font-semibold leading-tight tracking-tight text-balance sm:text-[20px]">
            {rec.title}
          </h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground text-pretty">
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
              <>まだ手をつけていない論点です。最初の一歩を踏み出しましょう。</>
            )}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {hasLesson && (
              <Link
                href={`/learn/study/${rec.slug}`}
                className="inline-flex h-10 items-center gap-1.5 rounded-full bg-foreground px-4 text-[13px] font-semibold text-background shadow-ios hover:brightness-110 active:scale-[0.98]"
              >
                <BookOpen className="h-3.5 w-3.5" />
                記事を読む
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
        <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10.5px] font-semibold backdrop-blur">
          {locked ? "Pro" : kicker}
        </span>
      </div>
      <div className="relative z-10">
        <div className="text-[16px] font-semibold leading-tight tracking-tight">
          {title}
        </div>
        <div className="text-[11.5px] opacity-85">{sub}</div>
      </div>
    </Link>
  );
}

function greetingFor(h: number) {
  if (h < 5) return "夜更かしお疲れさま";
  if (h < 11) return "おはようございます";
  if (h < 17) return "こんにちは";
  if (h < 21) return "こんばんは";
  return "夜の学習、お疲れさま";
}

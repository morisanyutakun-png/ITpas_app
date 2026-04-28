import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  ChevronRight,
  Clock,
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

export const metadata = { title: "ITpassホーム" };

const MAJOR_META: Record<
  string,
  { hue: string; hueDim: string; label: string }
> = {
  strategy: {
    hue: "#FF375F",
    hueDim: "rgba(255,55,95,0.10)",
    label: "STRATEGY",
  },
  management: {
    hue: "#FF9500",
    hueDim: "rgba(255,149,0,0.10)",
    label: "MANAGEMENT",
  },
  technology: {
    hue: "#0A84FF",
    hueDim: "rgba(10,132,255,0.10)",
    label: "TECHNOLOGY",
  },
};

/**
 * ITpassホーム — 4 つのはっきりした輪郭だけ。
 *
 *   1) 地図      Map of the IT Passport curriculum (3 chapters, slim)
 *   2) 現在地    Where you are: 1 hero card with the next topic
 *   3) インプット 学習モード (figure-based lessons)
 *   4) アウトプット 3-tile output triad
 *
 * 統計・週バー・続きから一覧などは取り除き、フィードバックは /dashboard
 * への 1 リンクに集約。
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

  // Resolve study lessons (input). Limit to 3 for the home preview.
  const studyLessons = (
    await Promise.all(studySlugs.slice(0, 6).map((s) => getStudyLesson(s)))
  ).filter((l): l is NonNullable<typeof l> => l !== null);
  const studyAvailable = studyLessons.length > 0;

  // "現在地" — pick the lesson that matches the recommended topic if we
  // have a study file for it, else the recommended topic itself, else
  // the first topic that is not yet mastered.
  const lessonForRec =
    rec && studyLessons.find((l) => l.slug === rec.slug) ? rec.slug : null;

  const firstName = user.displayName?.split(" ")[0] ?? "学習者";

  return (
    <div className="space-y-12 pb-12">
      {/* ── Header ── */}
      <header className="space-y-1.5 pt-1">
        <div className="kicker">ITpass Home</div>
        <h1 className="text-ios-large font-semibold leading-[1.05] tracking-tight">
          ITpassホーム
        </h1>
        <p className="text-[13.5px] text-muted-foreground">
          {firstName}さん、こんにちは。
          {!pro && Number.isFinite(dailyLimit) && (
            <> 今日の無料枠は {dailyLimit as number} 問です。</>
          )}
        </p>
      </header>

      {/* ─────────────────────────────────────────────
          01 地図 — 3 chapter strips. No rings, no segments. Just the
          shape of the syllabus.
         ───────────────────────────────────────────── */}
      <Section
        kicker="01 · The Map"
        title="学習地図"
        sub="ITパスポートの 3 領域 / 中項目の俯瞰"
      >
        <div className="space-y-2">
          {roadmap.map((m) => (
            <ChapterStrip key={m.major} major={m} />
          ))}
        </div>
      </Section>

      {/* ─────────────────────────────────────────────
          02 現在地 — single hero. Knows what to do next.
         ───────────────────────────────────────────── */}
      <Section
        kicker="02 · You Are Here"
        title="現在地"
        sub="次に手をつけると効きやすい 1 論点"
      >
        {rec ? (
          <CurrentSpot rec={rec} hasLesson={lessonForRec !== null} />
        ) : (
          <div className="surface-card p-6 text-center text-[13px] text-muted-foreground">
            まずは下のアウトプットから 5 問解いて、現在地を把握しましょう。
          </div>
        )}
      </Section>

      {/* ─────────────────────────────────────────────
          03 インプット — 学習モード (figure-based lessons)
         ───────────────────────────────────────────── */}
      <Section
        kicker="03 · Input"
        title="インプット"
        sub="図解と要点で、論点を 60 秒で押さえる"
        rightHref="/learn/study"
        rightLabel="一覧"
      >
        {studyAvailable ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {studyLessons.slice(0, 4).map((l) => (
              <StudyCard
                key={l.slug}
                slug={l.slug}
                title={l.title}
                hook={l.hook}
                seconds={l.estimatedSeconds}
                questionCount={l.questionCount}
              />
            ))}
          </div>
        ) : (
          <Link
            href="/learn/study"
            className="surface-card flex items-center gap-4 p-5"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-foreground text-background shadow-tile">
              <BookOpen className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[16px] font-semibold">学習モードを開く</div>
              <div className="text-[12px] text-muted-foreground">
                図解と要点で論点を読む
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        )}
      </Section>

      {/* ─────────────────────────────────────────────
          04 アウトプット — 3 tiles. That's it.
         ───────────────────────────────────────────── */}
      <Section
        kicker="04 · Output"
        title="アウトプット"
        sub="解いて確かめる"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <OutputTile
            href="/learn/random"
            grad="bg-grad-purple"
            icon={Shuffle}
            kicker="Random"
            title="ランダム1問"
            sub="全範囲から抽選"
          />
          <OutputTile
            href="/learn/session/new?mode=weakness&count=5"
            grad="bg-grad-sunset"
            icon={Target}
            kicker="Weakness"
            title="弱点5問"
            sub="誤解パターンで重み付け"
          />
          <OutputTile
            href={canMock ? "/learn/mock-exam" : "/pricing?reason=mock_exam"}
            grad="bg-grad-ocean"
            icon={Timer}
            kicker="Mock Exam"
            title="模擬試験"
            sub="本番形式で力試し"
            locked={!canMock}
          />
        </div>
      </Section>

      {/* ─────────────────────────────────────────────
          Feedback — single quiet link to /dashboard.
         ───────────────────────────────────────────── */}
      <Link
        href="/dashboard"
        className="surface-card flex items-center gap-4 p-5"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <BarChart3 className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Feedback
          </div>
          <div className="text-[15px] font-semibold">分析を見る</div>
          <div className="text-[12px] text-muted-foreground">
            正答率・連続記録・弱点トップ3
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </Link>
    </div>
  );
}

// ── Subcomponents ────────────────────────────────────────────────────────

function Section({
  kicker,
  title,
  sub,
  rightHref,
  rightLabel,
  children,
}: {
  kicker: string;
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
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {kicker}
          </div>
          <div className="mt-1 text-[22px] font-semibold leading-tight tracking-tight">
            {title}
          </div>
          {sub && (
            <div className="mt-0.5 text-[12.5px] text-muted-foreground text-pretty">
              {sub}
            </div>
          )}
        </div>
        {rightHref && rightLabel && (
          <Link
            href={rightHref}
            className="inline-flex shrink-0 items-center gap-0.5 text-[12px] font-medium text-muted-foreground hover:text-foreground"
          >
            {rightLabel} <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

/** Slim chapter strip — the whole "map" is just three of these stacked. */
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
        className="w-1 shrink-0 rounded-full"
        style={{ background: meta.hue }}
      />
      <div className="min-w-0 flex-1">
        <div
          className="text-[10.5px] font-semibold uppercase tracking-[0.16em]"
          style={{ color: meta.hue }}
        >
          {meta.label}
        </div>
        <div className="mt-0.5 text-[16px] font-semibold tracking-tight">
          {major.label}
        </div>
        <div className="text-[12px] text-muted-foreground">
          {major.minors.length} 中項目 · {major.topicCount} 論点
        </div>
        <div
          className="mt-2 h-1 overflow-hidden rounded-full"
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
        <div className="num text-[20px] font-semibold leading-none tracking-tight">
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

/** Single hero card — the editorial "you are here" recommendation. */
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
    <article className="editorial-card relative overflow-hidden p-6 sm:p-7">
      <div className="relative z-10 space-y-3">
        <div className="kicker">Up Next · {rec.reason}</div>
        <h2 className="text-[26px] font-semibold leading-tight tracking-tight text-balance sm:text-[30px]">
          {rec.title}
        </h2>
        <div className="text-[12.5px] text-muted-foreground">
          {rec.attempted > 0 ? (
            <>
              これまで{" "}
              <span className="num font-semibold text-foreground">
                {rec.attempted}
              </span>
              問 · 正答率{" "}
              <span className="num font-semibold text-foreground">
                {ratePct}%
              </span>
            </>
          ) : (
            "未挑戦の論点。ここから固める。"
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {hasLesson && (
            <Link
              href={`/learn/study/${rec.slug}`}
              className="inline-flex h-11 items-center gap-1.5 rounded-full bg-foreground px-5 text-[14px] font-semibold text-background shadow-ios hover:brightness-110 active:opacity-90"
            >
              <BookOpen className="h-4 w-4" />
              インプット (図解で読む)
            </Link>
          )}
          <Link
            href={`/learn/session/new?mode=topic&topic=${rec.slug}&count=5`}
            className={`inline-flex h-11 items-center gap-1.5 rounded-full px-5 text-[14px] font-semibold ${
              hasLesson
                ? "bg-muted text-foreground hover:bg-muted/70"
                : "bg-foreground text-background shadow-ios hover:brightness-110"
            }`}
          >
            <PlayCircle className="h-4 w-4" />
            アウトプット (5問)
          </Link>
        </div>
      </div>
    </article>
  );
}

function StudyCard({
  slug,
  title,
  hook,
  seconds,
  questionCount,
}: {
  slug: string;
  title: string;
  hook: string;
  seconds: number;
  questionCount: number;
}) {
  return (
    <Link
      href={`/learn/study/${slug}`}
      className="surface-card group flex h-full flex-col gap-2 p-5"
    >
      <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        <BookOpen className="h-3 w-3" />
        Lesson
      </div>
      <div className="text-[16px] font-semibold leading-tight tracking-tight">
        {title}
      </div>
      <p className="line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground text-pretty">
        {hook}
      </p>
      <div className="mt-auto flex items-center gap-3 pt-2 text-[11.5px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {Math.round(seconds / 10) * 10}秒
        </span>
        <span className="inline-flex items-center gap-1">
          <ArrowRight className="h-3 w-3" />
          {questionCount}問へ
        </span>
      </div>
    </Link>
  );
}

function OutputTile({
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
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] opacity-85">
          {locked ? "Pro" : kicker}
        </span>
      </div>
      <div className="relative z-10">
        <div className="text-[17px] font-semibold leading-tight tracking-tight">
          {title}
        </div>
        <div className="text-[11.5px] opacity-85">{sub}</div>
      </div>
    </Link>
  );
}

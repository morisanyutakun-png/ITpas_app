import Link from "next/link";
import { sql } from "drizzle-orm";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Clock,
  Compass,
  Flame,
  Map as MapIcon,
  PlayCircle,
  Shuffle,
  Target,
  Timer,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { db } from "@/db/client";
import { getCurrentUser } from "@/lib/currentUser";
import { hasFeature, isPro, limitsFor } from "@/lib/plan";
import { getDailyStats, getRecommendation } from "@/server/queries/history";
import { getRoadmap } from "@/server/queries/roadmap";
import { listStudyLessonSlugs, getStudyLesson } from "@/server/queries/study";
import { listTopics } from "@/server/queries/topics";
import { LessonThumbnail } from "@/components/study/Thumbnail";
import type { StudyFigure } from "@/lib/contentSchema";

export const dynamic = "force-dynamic";
export const metadata = { title: "ホーム" };

/**
 * ToC 向けの「今日のホーム画面」。
 *
 * - 今日 1 アクションだけを大きく見せる Hero（時間帯で出し分け）
 * - 「今日のミッション」3行（読む / 解く / 振り返る）
 * - 連続記録の控えめ表示（直近14日の活動から導出）
 * - 「気分で選ぶ」3タイル（5分 / 15分 / 模試）
 * - 詳しいコンテンツ（カリキュラム・全体地図）は折りたたみで密度を抑える
 */
export default async function HomePage() {
  const user = await getCurrentUser();
  const pro = isPro(user);
  const canMock = hasFeature(user, "mockExam");
  const dailyLimit = limitsFor(user.plan).dailyQuestionAttempts;

  const [rec, roadmap, studySlugs, allTopics, daily, todayCountRow] = await Promise.all([
    getRecommendation(user.id),
    getRoadmap(user.id),
    listStudyLessonSlugs(),
    listTopics(),
    getDailyStats(user.id, 14),
    db.execute(sql`
      SELECT COUNT(*)::int AS n
      FROM attempts
      WHERE user_id = ${user.id}
        AND result IN ('correct', 'incorrect')
        AND (started_at AT TIME ZONE 'Asia/Tokyo')::date
            = (now() AT TIME ZONE 'Asia/Tokyo')::date
    `),
  ]);
  const topicBySlug = new Map(allTopics.map((t) => [t.slug, t]));

  const studyLessons = (
    await Promise.all(studySlugs.slice(0, 6).map((s) => getStudyLesson(s)))
  ).filter((l): l is NonNullable<typeof l> => l !== null);

  const hueOf = (slug: string): string => {
    const t = topicBySlug.get(slug);
    return MAJOR_META[t?.majorCategory ?? "technology"]?.hue ?? "#0A84FF";
  };

  const featured =
    (rec && studyLessons.find((l) => l.slug === rec.slug)) ??
    studyLessons[0] ??
    null;
  const otherLessons = featured
    ? studyLessons.filter((l) => l.slug !== featured.slug).slice(0, 4)
    : studyLessons.slice(0, 4);

  const firstName = user.displayName?.split(" ")[0] ?? null;
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const hour = jst.getUTCHours();
  const greeting = greetingFor(hour);
  const todayQuestionCount = Number(
    (todayCountRow.rows[0] as { n?: number } | undefined)?.n ?? 0
  );

  // Streak (consecutive days with at least 1 attempt, ending today)
  const streakDays = computeStreak(daily);

  // Today's mission state
  const todayHasReading = false; // 読了状態は未実装。常に false 扱いで誘導を維持
  const todayHasReview = todayQuestionCount > 0;
  const todayMissionState = {
    read: todayHasReading,
    solve: todayQuestionCount > 0,
    review: todayHasReview && todayQuestionCount >= 3,
  };

  return (
    <div className="space-y-8 pb-12">
      {/* ── Greeting + streak ─────────── */}
      <header className="flex items-end justify-between gap-4 pt-1">
        <div className="min-w-0 space-y-1">
          <div className="text-[12px] text-muted-foreground">
            {formatJstDate(jst)}
          </div>
          <h1 className="text-[24px] font-semibold leading-tight tracking-tight sm:text-[28px]">
            {greeting}
            {firstName ? `、${firstName}さん` : ""}。
          </h1>
        </div>
        {streakDays > 0 && (
          <div className="shrink-0 rounded-2xl bg-card px-3.5 py-2 ring-1 ring-black/[0.05] shadow-ios-sm dark:ring-white/[0.07]">
            <div className="flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-ios-orange" strokeWidth={2.4} />
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ios-orange">
                Streak
              </span>
            </div>
            <div className="num mt-0.5 text-[20px] font-semibold leading-none tracking-tight">
              {streakDays}
              <span className="ml-0.5 text-[11px] font-medium text-muted-foreground">
                日
              </span>
            </div>
          </div>
        )}
      </header>

      {/* ── Today's hero — 時間帯で出し分け ── */}
      <TodayHero
        hour={hour}
        featured={featured}
        rec={rec}
        hueOf={hueOf}
      />

      {/* ── 今日のミッション ── */}
      <TodayMission
        state={todayMissionState}
        attemptedToday={todayQuestionCount}
        dailyLimit={pro ? Infinity : (dailyLimit as number)}
      />

      {/* ── 気分で選ぶ ── */}
      <Section
        title="気分で選ぶ"
        sub="今日の時間に合わせて、ぴったりの長さで"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <MoodTile
            href="/learn/random"
            grad="bg-grad-purple"
            icon={Shuffle}
            kicker="5分"
            title="サクッと1問"
            sub="気分転換に"
          />
          <MoodTile
            href="/learn/session/new?mode=weakness&count=5"
            grad="bg-grad-sunset"
            icon={Target}
            kicker="15分"
            title="弱点を5問"
            sub="効くところから"
          />
          <MoodTile
            href={canMock ? "/learn/mock-exam" : "/pricing?reason=mock_exam"}
            grad="bg-grad-ocean"
            icon={Timer}
            kicker={canMock ? "120分" : "Pro"}
            title="模擬試験"
            sub={canMock ? "本番形式100問" : "Proで開放"}
            locked={!canMock}
          />
        </div>
      </Section>

      {/* ── 続きの読み物 ── */}
      {otherLessons.length > 0 && (
        <Section
          title="読みかけ・気になる記事"
          sub="3〜7分で1本読み切れます"
          rightHref="/learn/study"
          rightLabel="記事一覧"
        >
          <div className="grid gap-3 sm:grid-cols-2">
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
        </Section>
      )}

      {/* ── 全体像（折りたたみ） ── */}
      <details className="group surface-card overflow-hidden p-0 [&_summary::-webkit-details-marker]:hidden">
        <summary className="flex cursor-pointer list-none items-center gap-3 p-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-grad-blue text-white shadow-tile">
            <MapIcon className="h-4 w-4" strokeWidth={2.2} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-semibold tracking-tight">
              ITパスポート全体像を見る
            </div>
            <div className="mt-0.5 text-[12px] text-muted-foreground">
              3分野・カリキュラム・あなたの現在地
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90" />
        </summary>
        <div className="space-y-2 px-5 pb-5">
          <Link
            href="/map"
            className="flex items-center gap-3 rounded-2xl bg-muted/40 p-4 transition-transform active:scale-[0.99]"
          >
            <Compass className="h-4 w-4 text-ios-blue" strokeWidth={2.4} />
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-semibold">
                コンセプトマップで現在地を確認
              </div>
              <div className="text-[11.5px] text-muted-foreground">
                試験範囲のどこにいるか地図で
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          {roadmap.map((m) => (
            <ChapterStrip key={m.major} major={m} />
          ))}
        </div>
      </details>

      {/* ── 進捗フッター ── */}
      <Link
        href="/dashboard"
        className="surface-card flex items-center gap-4 p-5"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-grad-green text-white shadow-tile">
          <TrendingUp className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[16px] font-semibold tracking-tight">
            学習レポートを見る
          </div>
          <div className="mt-0.5 text-[12.5px] text-muted-foreground">
            今週のペース・苦手の型・本番までの距離
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </Link>
    </div>
  );
}

// ── Today's hero ───────────────────────────────────────────────────────────

type Featured =
  | {
      slug: string;
      title: string;
      dek?: string | null;
      hook: string;
      readingMinutes: number;
      questionCount: number;
      figure: { kind: StudyFigure["kind"] };
    }
  | null;

type Rec = {
  slug: string;
  title: string;
  reason: string;
  attempted: number;
  correctRate: number;
} | null;

function TodayHero({
  hour,
  featured,
  rec,
  hueOf,
}: {
  hour: number;
  featured: Featured;
  rec: Rec;
  hueOf: (slug: string) => string;
}) {
  // 朝 = 読み物、昼 = 1問、夜 = 復習
  const mode: "read" | "solve" | "review" =
    hour < 11 ? "read" : hour < 17 ? "solve" : "review";

  if (mode === "read" && featured) {
    return (
      <FeaturedLessonHero
        slug={featured.slug}
        title={featured.title}
        dek={featured.dek ?? null}
        hook={featured.hook}
        readingMinutes={featured.readingMinutes}
        questionCount={featured.questionCount}
        figureKind={featured.figure.kind}
        hue={hueOf(featured.slug)}
        kicker="今朝のおすすめ"
        ctaLabel="この記事を読む"
      />
    );
  }

  if (mode === "review" && rec) {
    return <ReviewHero rec={rec} />;
  }

  // mode === "solve" or fallback
  return <SolveHero rec={rec} featured={featured} hueOf={hueOf} />;
}

function SolveHero({
  rec,
  featured,
  hueOf,
}: {
  rec: Rec;
  featured: Featured;
  hueOf: (slug: string) => string;
}) {
  if (rec) {
    return (
      <article className="surface-card relative overflow-hidden p-6 sm:p-7">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-grad-blue opacity-[0.18] blur-3xl"
        />
        <div className="relative flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-grad-blue text-white shadow-tile">
            <Compass className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ios-blue">
              今日の一歩
            </div>
            <h2 className="mt-1 text-[20px] font-semibold leading-tight tracking-tight sm:text-[22px]">
              {rec.title}
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground text-pretty">
              {rec.reason}
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Link
            href={`/learn/session/new?mode=topic&topic=${rec.slug}&count=5`}
            className="inline-flex h-11 items-center gap-1.5 rounded-full bg-foreground px-5 text-[14px] font-semibold text-background shadow-ios active:scale-[0.98]"
          >
            <PlayCircle className="h-4 w-4" />
            この論点を5問
          </Link>
          <Link
            href={`/learn/study/${rec.slug}`}
            className="inline-flex h-11 items-center gap-1.5 rounded-full bg-muted px-5 text-[13.5px] font-semibold text-foreground hover:bg-muted/70 active:scale-[0.98]"
          >
            <BookOpen className="h-3.5 w-3.5" />
            まず読む
          </Link>
        </div>
      </article>
    );
  }
  if (featured) {
    return (
      <FeaturedLessonHero
        slug={featured.slug}
        title={featured.title}
        dek={featured.dek ?? null}
        hook={featured.hook}
        readingMinutes={featured.readingMinutes}
        questionCount={featured.questionCount}
        figureKind={featured.figure.kind}
        hue={hueOf(featured.slug)}
        kicker="まずはここから"
        ctaLabel="読んでから1問"
      />
    );
  }
  return <FirstStepHero />;
}

function ReviewHero({ rec }: { rec: NonNullable<Rec> }) {
  const ratePct = rec.attempted > 0 ? Math.round(rec.correctRate * 100) : null;
  return (
    <article className="surface-card relative overflow-hidden p-6 sm:p-7">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-grad-purple opacity-[0.18] blur-3xl"
      />
      <div className="relative flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-grad-purple text-white shadow-tile">
          <Target className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ios-purple">
            夜の振り返り
          </div>
          <h2 className="mt-1 text-[20px] font-semibold leading-tight tracking-tight sm:text-[22px]">
            {rec.title} を、もう5問
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground text-pretty">
            {rec.attempted > 0 ? (
              <>
                直近の正答率{" "}
                <span className="num font-semibold text-foreground">
                  {ratePct}%
                </span>
                。1日の終わりに、苦手を1段階固めましょう。
              </>
            ) : (
              <>まだ手をつけていない論点です。寝る前に5問、軽く触れておきましょう。</>
            )}
          </p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Link
          href={`/learn/session/new?mode=topic&topic=${rec.slug}&count=5`}
          className="inline-flex h-11 items-center gap-1.5 rounded-full bg-foreground px-5 text-[14px] font-semibold text-background shadow-ios active:scale-[0.98]"
        >
          <PlayCircle className="h-4 w-4" />
          5問でしめる
        </Link>
        <Link
          href="/learn/random"
          className="inline-flex h-11 items-center gap-1.5 rounded-full bg-muted px-5 text-[13.5px] font-semibold text-foreground hover:bg-muted/70 active:scale-[0.98]"
        >
          <Shuffle className="h-3.5 w-3.5" />
          ランダムで1問
        </Link>
      </div>
    </article>
  );
}

function FirstStepHero() {
  return (
    <article className="relative overflow-hidden rounded-3xl bg-grad-ocean p-6 text-white shadow-hero sm:p-8">
      <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-white/15 blur-3xl" />
      <div className="relative">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-85">
          最初の一歩
        </div>
        <h2 className="mt-1 text-[22px] font-semibold leading-tight tracking-tight sm:text-[26px]">
          1問だけ、解いてみましょう
        </h2>
        <p className="mt-1.5 max-w-[44ch] text-[13.5px] leading-relaxed opacity-90 text-pretty">
          選択肢を選ぶと、誤答ごとに「なぜ引き寄せられたか」が読めます。
        </p>
        <div className="mt-5">
          <Link
            href="/learn/random"
            className="inline-flex h-11 items-center gap-1.5 rounded-full bg-white px-5 text-[14px] font-semibold text-foreground shadow-ios active:scale-[0.98]"
          >
            <PlayCircle className="h-4 w-4" />
            ランダムで1問
          </Link>
        </div>
      </div>
    </article>
  );
}

// ── Today's mission ────────────────────────────────────────────────────────

function TodayMission({
  state,
  attemptedToday,
  dailyLimit,
}: {
  state: { read: boolean; solve: boolean; review: boolean };
  attemptedToday: number;
  dailyLimit: number;
}) {
  const completed = Object.values(state).filter(Boolean).length;
  const limited = Number.isFinite(dailyLimit);
  return (
    <Section title="今日のミッション" sub="3つそろえると、その日は十分です">
      <div className="surface-card p-5 sm:p-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-[12px] text-muted-foreground">完了</div>
            <div className="num mt-0.5 text-[24px] font-semibold leading-none tracking-tight">
              {completed}
              <span className="ml-1 text-[12px] font-medium text-muted-foreground">
                / 3
              </span>
            </div>
          </div>
          {limited ? (
            <div className="text-right">
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Today
              </div>
              <div className="num text-[14px] font-semibold">
                {attemptedToday}
                <span className="text-muted-foreground"> / {dailyLimit}</span>
                <span className="text-[11px] text-muted-foreground"> 問</span>
              </div>
            </div>
          ) : (
            <div className="text-right">
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Today
              </div>
              <div className="num text-[14px] font-semibold">
                {attemptedToday}
                <span className="text-[11px] text-muted-foreground"> 問</span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
          <MissionRow
            done={state.read}
            label="読む"
            sub="記事を1本"
            href="/learn/study"
          />
          <MissionRow
            done={state.solve}
            label="解く"
            sub="1問でもOK"
            href="/learn/random"
          />
          <MissionRow
            done={state.review}
            label="振り返る"
            sub="3問以上で達成"
            href="/dashboard"
          />
        </div>
      </div>
    </Section>
  );
}

function MissionRow({
  done,
  label,
  sub,
  href,
}: {
  done: boolean;
  label: string;
  sub: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={[
        "flex items-center gap-3 rounded-2xl p-3.5 transition-transform active:scale-[0.99]",
        done
          ? "bg-ios-green/10 ring-1 ring-ios-green/25"
          : "bg-muted/40 ring-1 ring-black/[0.04] dark:ring-white/[0.06]",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold",
          done ? "bg-ios-green text-white" : "bg-muted text-muted-foreground",
        ].join(" ")}
      >
        {done ? "✓" : "·"}
      </span>
      <div className="min-w-0">
        <div
          className={[
            "text-[13.5px] font-semibold leading-tight",
            done ? "" : "text-foreground/95",
          ].join(" ")}
        >
          {label}
        </div>
        <div className="text-[11px] text-muted-foreground">{sub}</div>
      </div>
    </Link>
  );
}

// ── Streak compute ─────────────────────────────────────────────────────────

function computeStreak(daily: Array<{ day: string; total: number }>): number {
  // daily is sorted oldest → newest. Count consecutive days with attempts ending today.
  let streak = 0;
  for (let i = daily.length - 1; i >= 0; i--) {
    if (daily[i].total > 0) streak += 1;
    else break;
  }
  return streak;
}

// ── Section + pieces ───────────────────────────────────────────────────────

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
          <h2 className="text-[17px] font-semibold tracking-tight sm:text-[19px]">
            {title}
          </h2>
          {sub && (
            <p className="mt-0.5 text-[12px] text-muted-foreground text-pretty">
              {sub}
            </p>
          )}
        </div>
        {rightHref && rightLabel && (
          <Link
            href={rightHref}
            className="inline-flex shrink-0 items-center gap-0.5 text-[12px] font-medium text-muted-foreground hover:text-foreground"
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

function FeaturedLessonHero({
  slug,
  title,
  dek,
  hook,
  readingMinutes,
  questionCount,
  figureKind,
  hue,
  kicker,
  ctaLabel,
}: {
  slug: string;
  title: string;
  dek: string | null;
  hook: string;
  readingMinutes: number;
  questionCount: number;
  figureKind: StudyFigure["kind"];
  hue: string;
  kicker: string;
  ctaLabel: string;
}) {
  return (
    <Link
      href={`/learn/study/${slug}`}
      className="surface-card group relative block overflow-hidden p-0"
    >
      <div className="grid gap-0 sm:grid-cols-[1fr_220px]">
        <div className="space-y-3 p-6 sm:p-7">
          <div className="flex items-center gap-2">
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: hue }}
            >
              {kicker}
            </span>
            {dek && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                style={{ background: `${hue}14`, color: hue }}
              >
                <BookOpen className="h-3 w-3" />
                {dek}
              </span>
            )}
          </div>
          <h2 className="text-[22px] font-semibold leading-snug tracking-tight text-balance sm:text-[26px]">
            {title}
          </h2>
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
            <span aria-hidden className="text-border">·</span>
            <span>
              読んだら関連問題{" "}
              <span className="num font-semibold text-foreground">
                {questionCount}
              </span>{" "}
              問
            </span>
          </div>
          <div className="pt-2">
            <span className="inline-flex h-11 items-center gap-1.5 rounded-full bg-foreground px-5 text-[14px] font-semibold text-background shadow-ios transition-transform group-active:scale-[0.98]">
              {ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
        <div aria-hidden className="hidden h-full overflow-hidden sm:block">
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
        <div className="text-[15.5px] font-semibold leading-snug tracking-tight">
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
          <span
            aria-hidden
            className="ml-auto inline-flex items-center gap-1 text-muted-foreground/70"
          >
            <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function ChapterStrip({ major }: { major: Awaited<ReturnType<typeof getRoadmap>>[number] }) {
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
      className="group flex items-stretch gap-4 rounded-2xl bg-muted/40 p-4 transition-transform active:scale-[0.99]"
    >
      <span
        aria-hidden
        className="w-1 shrink-0 rounded-full"
        style={{ background: meta.hue }}
      />
      <div className="min-w-0 flex-1">
        <div className="text-[14.5px] font-semibold tracking-tight">
          {major.label}
        </div>
        <div className="text-[11.5px] text-muted-foreground">
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
        <div className="num text-[18px] font-semibold leading-none tracking-tight">
          {pct}
          <span className="ml-0.5 text-[10.5px] font-medium text-muted-foreground">
            %
          </span>
        </div>
        <span className="inline-flex items-center gap-0.5 text-[10.5px] font-semibold text-muted-foreground group-hover:text-foreground">
          開く
          <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

function MoodTile({
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
      className={`relative flex aspect-[5/4] flex-col justify-between overflow-hidden rounded-3xl ${grad} p-4 text-white shadow-hero transition-transform active:scale-[0.97]`}
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

function formatJstDate(jst: Date) {
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  return `${jst.getUTCFullYear()}年${jst.getUTCMonth() + 1}月${jst.getUTCDate()}日 (${days[jst.getUTCDay()]})`;
}

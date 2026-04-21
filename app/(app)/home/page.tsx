import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  ChevronRight,
  Clock,
  Flame,
  Lock,
  PlayCircle,
  Shuffle,
  Sparkles,
  Target,
  Timer,
  Zap,
} from "lucide-react";
import { getCurrentUser } from "@/lib/currentUser";
import {
  getMockExamTemplates,
  type MockExamTemplate,
} from "@/lib/examSources";
import { hasFeature, isPro, limitsFor, minAllowedExamYear } from "@/lib/plan";
import { getDailyStats, getRecommendation } from "@/server/queries/history";
import {
  getLastAttempt,
  getPersonalSummary,
} from "@/server/queries/personal";
import { listPastExams } from "@/server/queries/pastExams";
import { getRoadmap } from "@/server/queries/roadmap";
import { AccuracyRing } from "@/components/home/AccuracyRing";
import { ActivityWeek } from "@/components/home/ActivityWeek";
import { Roadmap } from "@/components/home/Roadmap";

export const dynamic = "force-dynamic";

const YEAR_GRAD: Record<number, string> = {
  7: "bg-grad-r07",
  6: "bg-grad-r06",
  5: "bg-grad-r05",
  2: "bg-grad-r02",
  1: "bg-grad-r01",
};

/**
 * Signed-in home. Editorial, Apple Music-inspired layout:
 *   1. Date kicker + named greeting
 *   2. Stats panel with AccuracyRing + 7-day activity
 *   3. "Today's practice" featured card (weakness-driven)
 *   4. Quick actions row (horizontal scroll of square tiles)
 *   5. Continue / For-you list
 *   6. Mock exam — past-paper album row (horizontal scroll)
 *   7. Roadmap
 *   8. Pro editorial card (if not adFree)
 */
export default async function HomePage() {
  const user = await getCurrentUser();
  const pro = isPro(user);
  const showAds = !hasFeature(user, "adFree");
  const plan = user.plan;
  const canMock = hasFeature(user, "mockExam");
  const dailyLimit = limitsFor(plan).dailyQuestionAttempts;

  const [summary, last, rec, roadmap, daily, templates, pastExams, minYear] =
    await Promise.all([
      getPersonalSummary(user.id),
      getLastAttempt(user.id),
      getRecommendation(user.id),
      getRoadmap(user.id),
      getDailyStats(user.id, 7),
      Promise.resolve(getMockExamTemplates()),
      listPastExams(),
      minAllowedExamYear(plan),
    ]);

  const accuracy =
    summary && summary.totalAttempts > 0
      ? Math.round((summary.correctAttempts / summary.totalAttempts) * 100)
      : null;

  const todayTotal =
    daily.length > 0 && isJstToday(daily[daily.length - 1].day)
      ? daily[daily.length - 1].total
      : 0;
  const dailyCap = Number.isFinite(dailyLimit) ? (dailyLimit as number) : null;
  const todayPct =
    dailyCap && dailyCap > 0 ? Math.min(100, (todayTotal / dailyCap) * 100) : 0;

  const firstName = user.displayName?.split(" ")[0] ?? "学習者";
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const dateStr = `${jst.getUTCMonth() + 1}月${jst.getUTCDate()}日 ${["日", "月", "火", "水", "木", "金", "土"][jst.getUTCDay()]}曜日`;
  const greetingKicker = greetingFor(jst.getUTCHours());

  const yearTemplates = templates.filter((t) => t.filter.kind === "year");

  return (
    <div className="space-y-8 pb-10">
      {/* ── 1. Editorial header ──────────────────────── */}
      <header className="space-y-1.5 pt-1">
        <div className="flex items-baseline justify-between">
          <div className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {dateStr}
          </div>
          <div className="text-[11.5px] font-medium text-muted-foreground">
            {greetingKicker}
          </div>
        </div>
        <h1 className="text-ios-large font-semibold leading-[1.05] tracking-tight text-balance">
          <span className="text-muted-foreground/75">こんにちは、</span>
          <br />
          {firstName}さん。
        </h1>
        <p className="text-[13.5px] text-muted-foreground">
          {pro
            ? "今日は何から攻めますか。"
            : `今日の無料枠は ${dailyCap ?? 10} 問。残り ${Math.max(0, (dailyCap ?? 10) - todayTotal)} 問。`}
        </p>
      </header>

      {/* ── 2. Stats panel (ring + week bars) ────────── */}
      <section
        aria-label="学習ダッシュボード"
        className="editorial-card p-5"
      >
        <div className="relative z-10 grid gap-5 sm:grid-cols-[auto_1px_1fr]">
          <div className="flex items-center gap-4">
            <AccuracyRing
              percent={accuracy}
              size={96}
              thickness={8}
              label="ACCURACY"
            />
            <div className="space-y-1.5">
              <StatLine
                icon={<Flame className="h-3.5 w-3.5 text-ios-orange" />}
                label="連続"
                value={summary.streakDays}
                unit="日"
              />
              <StatLine
                icon={<Target className="h-3.5 w-3.5 text-ios-blue" />}
                label="累計"
                value={summary.totalAttempts}
                unit="問"
              />
              <StatLine
                icon={<Bookmark className="h-3.5 w-3.5 text-ios-purple" />}
                label="ブックマーク"
                value={summary.bookmarkCount}
                unit="件"
              />
            </div>
          </div>
          <div
            aria-hidden
            className="hidden h-full w-px bg-border sm:block"
          />
          <div className="min-h-[150px]">
            <ActivityWeek data={daily} />
          </div>
        </div>
        {dailyCap && !pro && (
          <div className="relative z-10 mt-5 border-t border-border pt-4">
            <div className="flex items-baseline justify-between text-[11.5px]">
              <span className="font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                今日の枠
              </span>
              <span className="num text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {todayTotal}
                </span>
                {" / "}
                {dailyCap} 問
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-grad-sunset transition-[width] duration-500"
                style={{ width: `${Math.max(3, todayPct)}%` }}
              />
            </div>
          </div>
        )}
      </section>

      {/* ── 3. "Today's Practice" editorial hero ─────── */}
      <section>
        <EditorialHero
          rec={rec}
          fallbackTitle="弱点5問チャレンジ"
          fallbackSub="誤解パターン重み付きで、今日のあなたに刺さる5問"
        />
      </section>

      {/* ── 4. Quick actions row (horizontal scroll) ── */}
      <section className="space-y-3">
        <RuleLabel title="Quick Start" />
        <div className="hscroll">
          <QuickTile
            href="/learn/session/new?mode=weakness&count=5"
            grad="bg-grad-sunset"
            icon={<Target className="h-5 w-5" strokeWidth={2.2} />}
            label="弱点5問"
            sub="重み付き抽選"
          />
          <QuickTile
            href="/learn/random"
            grad="bg-grad-purple"
            icon={<Shuffle className="h-5 w-5" strokeWidth={2.2} />}
            label="ランダム1問"
            sub="全範囲から"
          />
          <QuickTile
            href="/learn/mock-exam"
            grad="bg-grad-ocean"
            icon={<Timer className="h-5 w-5" strokeWidth={2.2} />}
            label="模擬試験"
            sub="100問 / 120分"
            locked={!canMock}
          />
          <QuickTile
            href="/learn/past-exams"
            grad="bg-grad-ink"
            icon={<Zap className="h-5 w-5" strokeWidth={2.2} />}
            label="過去問"
            sub={`${pastExams.length}回分`}
          />
          <QuickTile
            href="/topics"
            grad="bg-grad-green"
            icon={<Sparkles className="h-5 w-5" strokeWidth={2.2} />}
            label="論点マップ"
            sub="ノード一覧"
          />
        </div>
      </section>

      {/* ── 5. Continue / For You ─────────────────── */}
      {(last || rec) && (
        <section className="space-y-3">
          <SectionHead kicker="For You" title="続きから" sub="迷ったらここから" />
          <div className="ios-list shadow-ios-sm">
            {last && (
              <Link
                href={
                  last.sessionId
                    ? `/learn/session/${last.sessionId}`
                    : `/learn/questions/${last.questionId}`
                }
                className="ios-row group active:bg-muted/60"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-grad-blue text-white shadow-tile">
                  <PlayCircle className="h-5 w-5" strokeWidth={2.2} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ios-blue">
                    {last.sessionId ? "SESSION" : "LAST QUESTION"}
                  </div>
                  <div className="text-[15px] font-medium">
                    {last.sessionId ? "前回のセッションを再開" : "直前の問題を開く"}
                  </div>
                  <div className="text-[11.5px] text-muted-foreground">
                    {relativeJp(new Date(last.createdAt))}
                    {" · "}
                    {last.result === "correct"
                      ? "正解"
                      : last.result === "incorrect"
                      ? "不正解"
                      : "スキップ"}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}
            {rec && (
              <Link
                href={`/learn/session/new?mode=topic&topic=${rec.slug}&count=5`}
                className="ios-row group active:bg-muted/60"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-grad-orange text-white shadow-tile">
                  <Flame className="h-5 w-5" strokeWidth={2.2} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ios-orange">
                    {rec.reason}
                  </div>
                  <div className="truncate text-[15px] font-medium">
                    {rec.title}
                  </div>
                  <div className="text-[11.5px] text-muted-foreground">
                    {rec.attempted > 0
                      ? `正答率 ${Math.round(rec.correctRate * 100)}% · ${rec.attempted}問`
                      : "今日が初挑戦"}
                    {" · "}5問セッション
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}
          </div>
        </section>
      )}

      {/* ── 6. Mock exam — past-paper album row ────── */}
      <section className="space-y-3">
        <SectionHead
          kicker="Past Papers"
          title="年度別模試"
          sub="公開問題ベースのフル模試"
          rightHref="/learn/past-exams"
          rightLabel="すべて"
        />
        <div className="hscroll">
          {yearTemplates.map((t) => {
            if (t.filter.kind !== "year") return null;
            const y = t.filter.examYear;
            const src = pastExams.find((p) => p.examYear === y);
            const locked =
              !canMock ||
              (minYear != null && y < minYear) ||
              t.tier === "premium" && plan !== "premium";
            return (
              <YearAlbum
                key={t.slug}
                template={t}
                year={y}
                label={src?.shortLabel ?? `R${y}`}
                imported={src?.importedCount ?? 0}
                total={src?.totalQuestions ?? 100}
                locked={locked}
              />
            );
          })}
        </div>
      </section>

      {/* ── 7. Roadmap ────────────────────────────── */}
      {roadmap && roadmap.length > 0 && <Roadmap majors={roadmap} signedIn />}

      {/* ── 8. Upgrade — Apple Arcade-style editorial card ── */}
      {showAds && (
        <section className="editorial-card overflow-hidden">
          <div className="relative z-10 grid gap-0 sm:grid-cols-[1.3fr_1fr]">
            <div className="p-6 sm:p-7">
              <div className="kicker">Editor's Pick · Pro</div>
              <h2 className="mt-3 text-[26px] font-semibold leading-tight tracking-tight">
                本気で合格を狙うなら、
                <br />
                <span className="bg-gradient-to-r from-[#FF9500] via-[#FF375F] to-[#AF52DE] bg-clip-text text-transparent">
                  Pro
                </span>
                に切り替える。
              </h2>
              <p className="mt-2 text-[13.5px] text-muted-foreground max-w-sm text-pretty">
                1日無制限 / 模擬試験 / 詳細分析 / 広告非表示。
                月額 ¥780。いつでも解約可能。
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Link
                  href="/pricing"
                  className="inline-flex h-11 items-center gap-1.5 rounded-full bg-foreground px-5 text-[14px] font-semibold text-background shadow-ios active:opacity-90"
                >
                  プランを比較
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/pricing?reason=mock_exam"
                  className="inline-flex h-11 items-center gap-1 rounded-full px-4 text-[13.5px] font-semibold text-muted-foreground active:opacity-80"
                >
                  模擬試験を体験
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
            <div className="relative hidden items-end justify-end overflow-hidden p-6 sm:flex">
              <span
                aria-hidden
                className="album-glyph text-[160px] leading-none bg-gradient-to-br from-foreground/90 to-foreground/30 bg-clip-text text-transparent"
                style={{
                  transform: "translate(18%, 12%) rotate(-4deg)",
                }}
              >
                Pro
              </span>
              <Sparkles className="absolute right-6 top-6 h-6 w-6 text-ios-purple/80" />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// ── Subcomponents ────────────────────────────────────────────────────────

function StatLine({
  icon,
  label,
  value,
  unit,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </span>
      <span className="num ml-auto text-[15px] font-semibold tracking-tight">
        {value}
        <span className="ml-0.5 text-[11px] font-medium text-muted-foreground">
          {unit}
        </span>
      </span>
    </div>
  );
}

function EditorialHero({
  rec,
  fallbackTitle,
  fallbackSub,
}: {
  rec: {
    slug: string;
    title: string;
    reason: string;
    attempted: number;
    correctRate: number;
  } | null;
  fallbackTitle: string;
  fallbackSub: string;
}) {
  const href = rec
    ? `/learn/session/new?mode=topic&topic=${rec.slug}&count=5`
    : "/learn/session/new?mode=weakness&count=5";
  const title = rec?.title ?? fallbackTitle;
  const sub = rec?.reason ?? fallbackSub;

  return (
    <Link
      href={href}
      className="editorial-card group relative block overflow-hidden p-7 sm:p-9"
    >
      <div className="relative z-10 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="space-y-3">
          <div className="kicker">Today's Practice</div>
          <h2 className="text-[30px] font-semibold leading-[1.08] tracking-tight text-balance sm:text-[36px]">
            {title}
          </h2>
          <p className="max-w-md text-[13.5px] text-muted-foreground text-pretty">
            {sub}
            {rec && rec.attempted > 0 && (
              <>
                {" · "}
                <span className="num font-medium text-foreground">
                  {Math.round(rec.correctRate * 100)}%
                </span>{" "}
                / {rec.attempted}問
              </>
            )}
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="inline-flex h-10 items-center gap-1.5 rounded-full bg-foreground px-4 text-[13.5px] font-semibold text-background shadow-ios transition-transform group-active:scale-[0.98]">
              <PlayCircle className="h-4 w-4" />
              5問セッションを開始
            </span>
            <span className="inline-flex items-center gap-1 text-[12px] text-muted-foreground">
              <Clock className="h-3 w-3" /> 約5〜8分
            </span>
          </div>
        </div>

        <div
          aria-hidden
          className="pointer-events-none hidden h-[140px] w-[140px] shrink-0 items-center justify-center sm:flex"
        >
          <div className="relative grid place-items-center">
            <span className="absolute inset-[-14px] rounded-full bg-grad-sunset opacity-50 blur-2xl" />
            <span className="relative flex h-[120px] w-[120px] items-center justify-center rounded-3xl bg-grad-sunset text-white shadow-hero">
              <Target className="h-10 w-10" strokeWidth={2.0} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function QuickTile({
  href,
  grad,
  icon,
  label,
  sub,
  locked,
}: {
  href: string;
  grad: string;
  icon: React.ReactNode;
  label: string;
  sub: string;
  locked?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`relative flex h-[128px] w-[140px] flex-col justify-between overflow-hidden rounded-2xl ${grad} p-3.5 text-white shadow-hero transition-transform active:scale-[0.97]`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(120% 80% at 100% 0%, rgba(255,255,255,0.22), transparent 55%)",
        }}
      />
      <div className="relative z-10 flex items-start justify-between">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 ring-1 ring-inset ring-white/25 backdrop-blur">
          {icon}
        </span>
        {locked && (
          <span className="glass-chip">
            <Lock className="h-3 w-3" /> Pro
          </span>
        )}
      </div>
      <div className="relative z-10">
        <div className="text-[15px] font-semibold leading-tight">{label}</div>
        <div className="text-[11px] opacity-85">{sub}</div>
      </div>
    </Link>
  );
}

function YearAlbum({
  template,
  year,
  label,
  imported,
  total,
  locked,
}: {
  template: MockExamTemplate;
  year: number;
  label: string;
  imported: number;
  total: number;
  locked: boolean;
}) {
  const grad = YEAR_GRAD[year] ?? "bg-grad-ink";
  const coverage = total > 0 ? Math.round((imported / total) * 100) : 0;

  return (
    <Link
      href={locked ? "/pricing?reason=mock_exam" : "/learn/mock-exam"}
      className={`relative flex h-[160px] w-[148px] flex-col justify-between overflow-hidden rounded-2xl ${grad} p-3.5 text-white shadow-hero transition-transform active:scale-[0.97] ${
        locked ? "grayscale-[0.2]" : ""
      }`}
    >
      <div
        aria-hidden
        className="album-glyph pointer-events-none absolute right-[-8%] top-[-14%] text-[120px] opacity-[0.18]"
      >
        {label}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(120% 80% at 100% 0%, rgba(255,255,255,0.24), transparent 55%), radial-gradient(100% 80% at 0% 100%, rgba(0,0,0,0.22), transparent 50%)",
        }}
      />
      <div className="relative z-10 flex items-start justify-between">
        <span className="glass-chip">公開問題</span>
        {locked ? (
          <Lock className="h-3.5 w-3.5 opacity-85" />
        ) : (
          <PlayCircle className="h-4 w-4 opacity-90" />
        )}
      </div>
      <div className="relative z-10">
        <div className="album-glyph text-[30px]">{label}</div>
        <div className="mt-0.5 text-[11px] opacity-90">
          {template.count}問 · {template.durationMin}分
        </div>
        <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full bg-white"
            style={{ width: `${Math.max(2, Math.min(100, coverage))}%` }}
          />
        </div>
        <div className="mt-1 text-[9.5px] opacity-80 num">
          収録 {coverage}%
        </div>
      </div>
    </Link>
  );
}

function SectionHead({
  kicker,
  title,
  sub,
  rightHref,
  rightLabel,
}: {
  kicker: string;
  title: string;
  sub?: string;
  rightHref?: string;
  rightLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between px-1">
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {kicker}
        </div>
        <div className="mt-0.5 text-[19px] font-semibold tracking-tight">
          {title}
        </div>
        {sub && <div className="text-[12px] text-muted-foreground">{sub}</div>}
      </div>
      {rightHref && rightLabel && (
        <Link
          href={rightHref}
          className="inline-flex items-center gap-0.5 text-[12px] font-medium text-muted-foreground active:opacity-70"
        >
          {rightLabel} <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

function RuleLabel({ title }: { title: string }) {
  return <div className="rule-label">{title}</div>;
}

// ── Helpers ───────────────────────────────────────────────────────────────

function greetingFor(h: number) {
  if (h < 5) return "Late Night";
  if (h < 11) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  if (h < 21) return "Good Evening";
  return "Late Night";
}

function isJstToday(ymd: string): boolean {
  const jst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return ymd === jst.toISOString().slice(0, 10);
}

function relativeJp(d: Date): string {
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "たった今";
  if (mins < 60) return `${mins}分前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}日前`;
  return `${Math.floor(days / 7)}週間前`;
}

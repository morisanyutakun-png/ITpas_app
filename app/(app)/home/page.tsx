import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Bookmark,
  ChevronRight,
  Compass,
  Flame,
  Lock,
  Network,
  PlayCircle,
  Shuffle,
  Skull,
  Target,
  Timer,
  type LucideIcon,
} from "lucide-react";
import { getCurrentUser } from "@/lib/currentUser";
import {
  getMockExamTemplates,
  type MockExamTemplate,
} from "@/lib/examSources";
import { hasFeature, isPro, limitsFor, minAllowedExamYear } from "@/lib/plan";
import { getDailyStats, getRecommendation } from "@/server/queries/history";
import { listMisconceptionsWithStats } from "@/server/queries/misconceptions";
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

export const metadata = { title: "ITpassホーム" };

const YEAR_GRAD: Record<number, string> = {
  7: "bg-grad-r07",
  6: "bg-grad-r06",
  5: "bg-grad-r05",
  2: "bg-grad-r02",
  1: "bg-grad-r01",
};

/**
 * ITpassホーム — 4 章構成。
 *  1. 学習地図 / 現在地 (Roadmap)
 *  2. アウトプット (ランダム演習・模試・過去問)
 *  3. インプット (学習ガイド・論点マップ・誤解辞典)
 *  4. フィードバック (進捗・分析)
 */
export default async function HomePage() {
  const user = await getCurrentUser();
  const pro = isPro(user);
  const plan = user.plan;
  const canMock = hasFeature(user, "mockExam");
  const dailyLimit = limitsFor(plan).dailyQuestionAttempts;

  const [summary, last, rec, roadmap, daily, templates, pastExams, minYear, miscAll] =
    await Promise.all([
      getPersonalSummary(user.id),
      getLastAttempt(user.id),
      getRecommendation(user.id),
      getRoadmap(user.id),
      getDailyStats(user.id, 7),
      Promise.resolve(getMockExamTemplates()),
      listPastExams(),
      minAllowedExamYear(plan),
      listMisconceptionsWithStats(user.id),
    ]);

  const enemy =
    miscAll
      .filter((m) => m.attempted >= 2)
      .sort((a, b) => b.incorrectRate - a.incorrectRate)[0] ??
    [...miscAll].sort((a, b) => b.usageCount - a.usageCount)[0] ??
    null;

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

  const totals = roadmap.reduce(
    (a, m) => ({
      topics: a.topics + m.topicCount,
      mastered: a.mastered + m.masteredCount,
      attempted: a.attempted + m.attemptedCount,
    }),
    { topics: 0, mastered: 0, attempted: 0 }
  );
  const overallPct =
    totals.topics > 0 ? Math.round((totals.mastered / totals.topics) * 100) : 0;

  const pastExamTemplates = templates.filter(
    (t) => t.sourceType === "past_exam" && t.filter.kind === "year"
  );
  const mockTemplates = templates.filter((t) => t.sourceType === "mock");

  return (
    <div className="space-y-10 pb-10">
      {/* ── Header ───────────────────────────────────── */}
      <header className="space-y-1.5 pt-1">
        <div className="flex items-baseline justify-between">
          <div className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {dateStr}
          </div>
          <div className="text-[11.5px] font-medium text-muted-foreground">
            {greetingKicker}
          </div>
        </div>
        <div className="kicker">ITpass Home</div>
        <h1 className="text-ios-large font-semibold leading-[1.05] tracking-tight text-balance">
          ITpassホーム
        </h1>
        <p className="text-[13.5px] text-muted-foreground">
          {firstName}さん、こんにちは。
          {pro
            ? "地図で現在地を見て、今日の一手を選びましょう。"
            : `今日の無料枠は ${dailyCap ?? 10} 問。残り ${Math.max(0, (dailyCap ?? 10) - todayTotal)} 問。`}
        </p>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          CHAPTER 1 — 学習地図 / 現在地
         ───────────────────────────────────────────────────────────── */}
      <ChapterDivider
        index="01"
        kicker="The Map"
        title="学習地図と、あなたの現在地"
        sub="ITパスポートの全領域を俯瞰し、いまどこに立っているかを確認します"
      />

      {roadmap && roadmap.length > 0 ? (
        <Roadmap majors={roadmap} signedIn />
      ) : (
        <div className="surface-card p-6 text-center text-[13px] text-muted-foreground">
          地図データを読み込めませんでした。
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          CHAPTER 2 — アウトプット (演習で試す)
         ───────────────────────────────────────────────────────────── */}
      <ChapterDivider
        index="02"
        kicker="Output · Practice"
        title="演習で力を試す"
        sub="豊富な過去問をベースに、ランダム演習・模試・年度別過去問へ"
      />

      {/* 続きから / おすすめ — 短いリスト */}
      {(last || rec || enemy) && (
        <section className="space-y-3">
          <RuleLabel title="続きから / あなたへ" />
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
            {enemy && (
              <Link
                href={`/learn/session/new?mode=weakness&misconception=${enemy.slug}&count=5`}
                className="ios-row group active:bg-muted/60"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-grad-purple text-white shadow-tile">
                  <AlertTriangle className="h-5 w-5" strokeWidth={2.2} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ios-purple">
                    {enemy.attempted >= 2 ? "今日の誤解" : "知っておきたい誤解"}
                  </div>
                  <div className="truncate text-[15px] font-medium">
                    {enemy.title}
                  </div>
                  <div className="text-[11.5px] text-muted-foreground">
                    {enemy.attempted >= 2
                      ? `誤答率 ${Math.round(enemy.incorrectRate * 100)}% · ${enemy.attempted}問の履歴`
                      : `関連 ${enemy.usageCount}問`}
                    {" · "}誤解パターンで5問
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}
          </div>
        </section>
      )}

      {/* 主要3導線: ランダム / 模試 / 弱点 */}
      <section className="space-y-3">
        <RuleLabel title="演習モード" />
        <div className="grid gap-3 sm:grid-cols-3">
          <ModeTile
            href="/learn/random"
            grad="bg-grad-purple"
            icon={Shuffle}
            kicker="Random"
            title="ランダム1問"
            sub="全範囲からランダム抽選"
          />
          <ModeTile
            href={canMock ? "/learn/mock-exam" : "/pricing?reason=mock_exam"}
            grad="bg-grad-ocean"
            icon={Timer}
            kicker="Mock Exam"
            title="模擬試験"
            sub="本番形式で力試し"
            lockedLabel={canMock ? undefined : "Pro"}
          />
          <ModeTile
            href="/learn/session/new?mode=weakness&count=5"
            grad="bg-grad-sunset"
            icon={Target}
            kicker="Sharpen"
            title="弱点5問"
            sub="誤解パターン重みで自動抽選"
          />
        </div>
      </section>

      {/* 過去問アーカイブ */}
      {(pastExamTemplates.length > 0 || mockTemplates.length > 0) && (
        <section className="space-y-4">
          <SectionHead
            kicker="Past Papers · Originals"
            title="過去問・オリジナル模試"
            sub="年度別の収録 + ITpass オリジナル"
            rightHref="/learn/mock-exam"
            rightLabel="すべて"
          />
          {pastExamTemplates.length > 0 && (
            <div className="space-y-2">
              <RuleLabel title="年度別 · IPA公開" />
              <div className="hscroll">
                {pastExamTemplates.map((t) => {
                  if (t.filter.kind !== "year") return null;
                  const y = t.filter.examYear;
                  const season = t.filter.examSeason;
                  const src = pastExams.find(
                    (p) =>
                      p.examYear === y &&
                      (season === undefined || p.examSeason === season)
                  );
                  const locked =
                    !canMock ||
                    (minYear != null && y < minYear) ||
                    (t.tier === "premium" && plan !== "premium");
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
            </div>
          )}
          {mockTemplates.length > 0 && (
            <div className="space-y-2">
              <RuleLabel title="ITpass · オリジナル" />
              <div className="hscroll">
                {mockTemplates.map((t) => {
                  const locked =
                    !canMock || (t.tier === "premium" && plan !== "premium");
                  return (
                    <MockAlbum key={t.slug} template={t} locked={locked} />
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          CHAPTER 3 — インプット (学んで理解する)
         ───────────────────────────────────────────────────────────── */}
      <ChapterDivider
        index="03"
        kicker="Input · Study"
        title="学んで理解する"
        sub="参考書のように体系的に読み、論点を掘り下げる"
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <StudyEntry
          href="/guides"
          accent="#34C759"
          icon={BookOpen}
          kicker="Reading Guide"
          title="学習ガイド"
          desc="3大領域を参考書のように体系的に読む"
        />
        <StudyEntry
          href="/topics"
          accent="#0A84FF"
          icon={Network}
          kicker="Topic Map"
          title="論点マップ"
          desc="OSI / 暗号 / PM — ノードから関連問題へ"
        />
        <StudyEntry
          href="/misconceptions"
          accent="#FF9500"
          icon={Skull}
          kicker="Trap Dictionary"
          title="誤解パターン辞典"
          desc="ひっかけの正体を予習する"
        />
      </section>

      {/* ─────────────────────────────────────────────────────────────
          CHAPTER 4 — フィードバック (進捗を確認する)
         ───────────────────────────────────────────────────────────── */}
      <ChapterDivider
        index="04"
        kicker="Feedback · Progress"
        title="進捗と分析"
        sub="正答率・連続記録・週の活動。詳細は分析ダッシュボードへ"
      />

      <section
        aria-label="今週の進捗"
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
                icon={<Compass className="h-3.5 w-3.5 text-ios-green" />}
                label="習熟"
                value={overallPct}
                unit="%"
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

      <Link
        href="/dashboard"
        className="surface-card group flex items-center gap-4 p-5 transition-transform active:scale-[0.99]"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-grad-purple text-white shadow-tile">
          <BarChart3 className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Analytics
          </div>
          <div className="text-[16px] font-semibold">
            分析ダッシュボードを開く
          </div>
          <div className="text-[12px] text-muted-foreground">
            習熟ヒートマップ / 弱点トップ3 / 学習プラン
          </div>
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

// ── Subcomponents ────────────────────────────────────────────────────────

/**
 * Numbered chapter divider — gives each of the four sections a magazine-style
 * heading so the order of the page (map → output → input → feedback) reads
 * as deliberate structure, not stacked widgets.
 */
function ChapterDivider({
  index,
  kicker,
  title,
  sub,
}: {
  index: string;
  kicker: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="border-t border-border pt-5">
      <div className="flex items-baseline gap-3 px-1">
        <span className="num text-[28px] font-semibold leading-none tracking-tight text-muted-foreground/50">
          {index}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {kicker}
          </div>
          <div className="mt-0.5 text-[20px] font-semibold tracking-tight text-balance">
            {title}
          </div>
          {sub && (
            <div className="mt-0.5 text-[12px] text-muted-foreground text-pretty">
              {sub}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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

function ModeTile({
  href,
  grad,
  icon: Icon,
  kicker,
  title,
  sub,
  lockedLabel,
}: {
  href: string;
  grad: string;
  icon: LucideIcon;
  kicker: string;
  title: string;
  sub: string;
  lockedLabel?: string;
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
        {lockedLabel ? (
          <span className="glass-chip">
            <Lock className="h-3 w-3" />
            {lockedLabel}
          </span>
        ) : (
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] opacity-85">
            {kicker}
          </span>
        )}
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

function StudyEntry({
  href,
  accent,
  icon: Icon,
  kicker,
  title,
  desc,
}: {
  href: string;
  accent: string;
  icon: LucideIcon;
  kicker: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group surface-card relative block overflow-hidden p-5 transition-transform active:scale-[0.99]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-[0.14] blur-2xl transition-opacity group-hover:opacity-[0.25]"
        style={{ background: accent }}
      />
      <div className="relative">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-tile"
          style={{ background: accent }}
        >
          <Icon className="h-5 w-5" strokeWidth={2.2} />
        </div>
        <div
          className="mt-4 text-[10.5px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: accent }}
        >
          {kicker}
        </div>
        <div className="mt-0.5 text-[16px] font-semibold tracking-tight">
          {title}
        </div>
        <p className="mt-1 text-[12.5px] text-muted-foreground text-pretty">
          {desc}
        </p>
        <div className="mt-3 inline-flex items-center gap-0.5 text-[12px] font-medium text-muted-foreground transition-transform group-hover:translate-x-0.5">
          開く <ChevronRight className="h-3.5 w-3.5" />
        </div>
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

function MockAlbum({
  template,
  locked,
}: {
  template: MockExamTemplate;
  locked: boolean;
}) {
  const grad =
    template.filter.kind === "category"
      ? template.filter.majorCategory === "strategy"
        ? "bg-grad-strategy"
        : template.filter.majorCategory === "management"
          ? "bg-grad-management"
          : "bg-grad-technology"
      : "bg-grad-purple";

  return (
    <Link
      href={locked ? "/pricing?reason=mock_exam" : "/learn/mock-exam"}
      className={`relative flex h-[160px] w-[168px] flex-col justify-between overflow-hidden rounded-2xl ${grad} p-3.5 text-white shadow-hero transition-transform active:scale-[0.97] ${
        locked ? "grayscale-[0.2]" : ""
      }`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(120% 80% at 100% 0%, rgba(255,255,255,0.24), transparent 55%), radial-gradient(100% 80% at 0% 100%, rgba(0,0,0,0.22), transparent 50%)",
        }}
      />
      <div className="relative z-10 flex items-start justify-between">
        <span className="glass-chip">オリジナル</span>
        {locked ? (
          <Lock className="h-3.5 w-3.5 opacity-85" />
        ) : (
          <PlayCircle className="h-4 w-4 opacity-90" />
        )}
      </div>
      <div className="relative z-10">
        {template.badge && (
          <div className="text-[10px] font-semibold uppercase tracking-[0.1em] opacity-85">
            {template.badge}
          </div>
        )}
        <div className="mt-0.5 line-clamp-2 text-[15px] font-semibold leading-tight">
          {template.label}
        </div>
        <div className="mt-1 text-[11px] opacity-90 num">
          {template.count}問 · {template.durationMin}分
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


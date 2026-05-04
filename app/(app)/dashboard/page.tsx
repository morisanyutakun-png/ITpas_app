import Link from "next/link";
import { sql } from "drizzle-orm";
import {
  ChevronRight,
  FileText,
  Flame,
  Lock,
  Target,
  Timer,
  TrendingUp,
} from "lucide-react";
import { db } from "@/db/client";
import { getCurrentUser } from "@/lib/currentUser";
import { hasFeature, isPro, MOCK_EXAM_DURATION_MIN } from "@/lib/plan";
import { getProgressByMisconception } from "@/server/queries/progress";
import { getDailyStats, getRecommendation } from "@/server/queries/history";
import { getRoadmap } from "@/server/queries/roadmap";
import { StudyPlan } from "@/components/dashboard/StudyPlan";
import { PaceCard } from "@/components/dashboard/PaceCard";
import { CategoryMastery } from "@/components/dashboard/CategoryMastery";
import { WeaknessTickets } from "@/components/dashboard/WeaknessTickets";
import { AdSlot } from "@/components/AdSlot";
import { ARCHETYPE_META } from "@/lib/misconceptionArchetypes";
import { getMisconceptionArchetype } from "@/server/content/misconceptionArchetypeMap";

export const dynamic = "force-dynamic";
export const metadata = { title: "学習レポート" };

const FREE_WEEKLY_TARGET = 35;
const PRO_WEEKLY_TARGET = 70;

/**
 * ToC 向けに刷新したダッシュボード。
 *
 * 上部に「3 行サマリー」＋「次の一歩」を置き、データ羅列の前に意思決定を
 * 助ける。詳細グラフ（ペース / 分野別 / 弱点リスト）は折りたたまずに残すが、
 * セクションヘッダーをやさしい日本語に書き換えた。
 */
export default async function DashboardPage() {
  const user = await getCurrentUser();
  const pro = isPro(user);
  const analyticsUnlocked = hasFeature(user, "advancedAnalytics");
  const mockExamUnlocked = hasFeature(user, "mockExam");
  const pdfUnlocked = hasFeature(user, "pdfExport");

  const [statsRow, weekRow, daily, misc, roadmap, recommended] = await Promise.all([
    db.execute(sql`
      SELECT
        COUNT(*)::int AS total,
        SUM(CASE WHEN result = 'correct' THEN 1 ELSE 0 END)::int AS correct
      FROM attempts
      WHERE user_id = ${user.id} AND result IN ('correct', 'incorrect')
    `),
    db.execute(sql`
      SELECT
        COUNT(*)::int AS total,
        SUM(CASE WHEN result = 'correct' THEN 1 ELSE 0 END)::int AS correct
      FROM attempts
      WHERE user_id = ${user.id}
        AND result IN ('correct', 'incorrect')
        AND started_at >= now() - interval '7 days'
    `),
    getDailyStats(user.id, 14),
    getProgressByMisconception(user.id),
    getRoadmap(user.id),
    getRecommendation(user.id),
  ]);

  const stats = (statsRow.rows[0] ?? {}) as { total?: number; correct?: number };
  const total = Number(stats.total ?? 0);
  const correct = Number(stats.correct ?? 0);
  const accuracy = total > 0 ? correct / total : 0;

  const week = (weekRow.rows[0] ?? {}) as { total?: number; correct?: number };
  const weekTotal = Number(week.total ?? 0);
  const weekCorrect = Number(week.correct ?? 0);
  const weekAccuracy = weekTotal > 0 ? weekCorrect / weekTotal : 0;

  const allTopicCount = roadmap.reduce((s, m) => s + m.topicCount, 0);
  const attemptedTopicCount = roadmap.reduce((s, m) => s + m.attemptedCount, 0);
  const coverage = allTopicCount ? attemptedTopicCount / allTopicCount : 0;

  const topMisconception =
    misc.find((m) => m.attempted >= 2 && m.incorrectRate >= 0.3) ?? null;
  const topArchetype = topMisconception
    ? getMisconceptionArchetype(topMisconception.slug)
    : null;
  const archetypeMeta = topArchetype ? ARCHETYPE_META[topArchetype] : null;

  const weeklyTarget = pro ? PRO_WEEKLY_TARGET : FREE_WEEKLY_TARGET;
  const streakDays = computeStreak(daily);

  return (
    <div className="space-y-7 pb-10">
      {/* ── Header ─────────── */}
      <header className="space-y-1.5 pt-1">
        <div className="kicker">Your Report</div>
        <h1 className="text-ios-large font-semibold leading-[1.05] tracking-tight">
          学習レポート
        </h1>
        <p className="text-[13.5px] text-muted-foreground">
          現在地と次の一歩を、ここで確認しましょう。
        </p>
      </header>

      {/* ── Tri-summary ─────────── */}
      <SummaryCard
        weekTotal={weekTotal}
        weekAccuracy={weekAccuracy}
        weeklyTarget={weeklyTarget}
        streakDays={streakDays}
        archetypeLabel={archetypeMeta?.label ?? null}
        archetypeHue={archetypeMeta?.hue ?? null}
      />

      {/* ── 1. 次の一歩 (StudyPlan) ── */}
      <StudyPlan
        totalAttempts={total}
        accuracy={accuracy}
        coverage={coverage}
        topMisconception={
          topMisconception
            ? {
                slug: topMisconception.slug,
                title: topMisconception.title,
                incorrectRate: topMisconception.incorrectRate,
                attempted: topMisconception.attempted,
              }
            : null
        }
        weakestTopic={recommended}
        canMockExam={mockExamUnlocked}
      />

      {!pro && <AdSlot variant="banner" />}

      {/* ── 2. 今週のペース ── */}
      <section className="space-y-3">
        <SectionHead
          title="今週のペース"
          sub={`${pro ? "Pro" : "Free"} の目安は週 ${weeklyTarget}問`}
        />
        <PaceCard daily={daily} weeklyTarget={weeklyTarget} />
      </section>

      {/* ── 3. 3分野の習熟度 ── */}
      <section className="space-y-3">
        <SectionHead
          title="3分野の習熟度"
          sub="60% 以上が合格ラインの目安です"
        />
        {analyticsUnlocked || total >= 5 ? (
          <CategoryMastery majors={roadmap} />
        ) : (
          <ProGate />
        )}
      </section>

      {/* ── 4. 苦手の型トップ3 ── */}
      <section className="space-y-3">
        <SectionHead
          title="優先して潰したい3つ"
          sub="誤答率の高い型から、5問ずつ"
          rightHref="/misconceptions"
          rightLabel="すべて見る"
        />
        <WeaknessTickets items={misc} />
      </section>

      {/* ── 5. ツール ── */}
      <section className="space-y-3">
        <SectionHead title="ツール" />
        <div className="grid gap-3 sm:grid-cols-3">
          <ToolCard
            href={mockExamUnlocked ? "/learn/mock-exam" : "/pricing?reason=mock_exam"}
            hue="#0A84FF"
            icon={Timer}
            kicker="本番形式"
            title={`模擬試験 ${MOCK_EXAM_DURATION_MIN}分`}
            desc="100問の本番リハーサル"
            locked={!mockExamUnlocked}
          />
          <ToolCard
            href={pdfUnlocked ? "/account/report" : "/pricing?reason=pdf_export"}
            hue="#34C759"
            icon={FileText}
            kicker="PDF"
            title="学習レポート"
            desc="累計・正答率・苦手を1枚に"
            locked={!pdfUnlocked}
          />
          <ToolCard
            href="/learn/session/new?mode=weakness&count=5"
            hue="#AF52DE"
            icon={Target}
            kicker="苦手"
            title="弱点5問"
            desc="重み付きで自動抽出"
            locked={false}
          />
        </div>
      </section>
    </div>
  );
}

// ── Tri-summary ────────────────────────────────────────────────────────────

function SummaryCard({
  weekTotal,
  weekAccuracy,
  weeklyTarget,
  streakDays,
  archetypeLabel,
  archetypeHue,
}: {
  weekTotal: number;
  weekAccuracy: number;
  weeklyTarget: number;
  streakDays: number;
  archetypeLabel: string | null;
  archetypeHue: string | null;
}) {
  const pct = Math.round(weekAccuracy * 100);
  const summary = buildSummaryLine({
    weekTotal,
    pct,
    weeklyTarget,
    streakDays,
    archetypeLabel,
  });
  return (
    <article className="surface-card relative overflow-hidden p-6 sm:p-7">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-grad-blue opacity-[0.18] blur-3xl"
      />
      <div className="relative">
        <div className="kicker">This Week</div>
        <h2 className="mt-1 text-[18px] font-semibold leading-snug tracking-tight sm:text-[20px] text-pretty">
          {summary}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Metric
            icon={Target}
            label="今週の問題数"
            value={String(weekTotal)}
            unit="問"
            sub={`目標 ${weeklyTarget}問`}
            hue="#0A84FF"
          />
          <Metric
            icon={TrendingUp}
            label="今週の正答率"
            value={weekTotal > 0 ? String(pct) : "–"}
            unit={weekTotal > 0 ? "%" : ""}
            sub={weekTotal > 0 ? "60% で合格圏" : "まずは1問から"}
            hue="#34C759"
          />
          {archetypeLabel && archetypeHue ? (
            <Metric
              icon={Flame}
              label="最大の敵"
              value={archetypeLabel}
              unit="型"
              sub="優先して攻略"
              hue={archetypeHue}
            />
          ) : (
            <Metric
              icon={Flame}
              label="連続記録"
              value={String(streakDays)}
              unit="日"
              sub={streakDays > 0 ? "今日も続いてます" : "今日から始めよう"}
              hue="#FF9500"
            />
          )}
        </div>
      </div>
    </article>
  );
}

function buildSummaryLine({
  weekTotal,
  pct,
  weeklyTarget,
  streakDays,
  archetypeLabel,
}: {
  weekTotal: number;
  pct: number;
  weeklyTarget: number;
  streakDays: number;
  archetypeLabel: string | null;
}): string {
  if (weekTotal === 0) {
    return streakDays > 0
      ? `今週はまだ。${streakDays}日連続を、今日も繋ぎましょう。`
      : "まずは今週、1問から。";
  }
  const paceNote =
    weekTotal >= weeklyTarget ? "目標達成ペース" : "ペース増やしどき";
  const accuracyNote = pct >= 70 ? "好調" : pct >= 50 ? "もう一押し" : "テコ入れ要";
  if (archetypeLabel) {
    return `今週 ${weekTotal}問・正答率 ${pct}%（${accuracyNote}）。最大の敵は「${archetypeLabel}」型です。`;
  }
  return `今週 ${weekTotal}問・正答率 ${pct}%。${paceNote}・${accuracyNote}。`;
}

function Metric({
  icon: Icon,
  label,
  value,
  unit,
  sub,
  hue,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  unit: string;
  sub: string;
  hue: string;
}) {
  return (
    <div
      className="flex items-start gap-3 rounded-2xl bg-card p-4 ring-1 ring-black/[0.04] dark:ring-white/[0.06]"
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-tile"
        style={{ background: hue }}
      >
        <Icon className="h-4 w-4" strokeWidth={2.4} />
      </span>
      <div className="min-w-0">
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </div>
        <div className="num mt-0.5 text-[20px] font-semibold leading-none tracking-tight">
          {value}
          {unit && (
            <span className="ml-0.5 text-[11px] font-medium text-muted-foreground">
              {unit}
            </span>
          )}
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>
      </div>
    </div>
  );
}

function computeStreak(daily: Array<{ day: string; total: number }>): number {
  let streak = 0;
  for (let i = daily.length - 1; i >= 0; i--) {
    if (daily[i].total > 0) streak += 1;
    else break;
  }
  return streak;
}

// ── Subcomponents ─────────────────────────────────────────────────────────

function SectionHead({
  title,
  sub,
  rightHref,
  rightLabel,
}: {
  title: string;
  sub?: string;
  rightHref?: string;
  rightLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between px-1">
      <div className="min-w-0">
        <div className="mt-1 text-[18px] font-semibold tracking-tight">
          {title}
        </div>
        {sub && <div className="text-[12px] text-muted-foreground">{sub}</div>}
      </div>
      {rightHref && rightLabel && (
        <Link
          href={rightHref}
          className="inline-flex shrink-0 items-center gap-0.5 text-[12px] font-medium text-muted-foreground active:opacity-70"
        >
          {rightLabel}
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

function ProGate() {
  return (
    <Link
      href="/pricing?reason=advanced_analytics"
      className="surface-card flex items-center gap-4 p-5 transition-transform active:scale-[0.99]"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Lock className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-semibold">詳細分析は Pro で</div>
        <div className="text-[12px] text-muted-foreground">
          5問解くか、Pro にすると分野別の習熟度が見られます
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}

function ToolCard({
  href,
  hue,
  icon: Icon,
  kicker,
  title,
  desc,
  locked,
}: {
  href: string;
  hue: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  kicker: string;
  title: string;
  desc: string;
  locked: boolean;
}) {
  return (
    <Link
      href={href}
      className="group surface-card relative block overflow-hidden p-5 transition-transform active:scale-[0.99]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-[0.14] blur-2xl transition-opacity group-hover:opacity-[0.25]"
        style={{ background: hue }}
      />
      <div className="relative flex items-start justify-between">
        <span
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-tile"
          style={{ background: hue }}
        >
          <Icon className="h-5 w-5" strokeWidth={2.2} />
        </span>
        {locked && (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            <Lock className="h-3 w-3" />
            Pro
          </span>
        )}
      </div>
      <div className="relative mt-4">
        <div
          className="text-[10.5px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: hue }}
        >
          {kicker}
        </div>
        <div className="mt-0.5 text-[16px] font-semibold tracking-tight">
          {title}
        </div>
        <div className="mt-1 text-[12px] text-muted-foreground text-pretty">
          {desc}
        </div>
      </div>
    </Link>
  );
}

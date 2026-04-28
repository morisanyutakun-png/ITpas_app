import Link from "next/link";
import { sql } from "drizzle-orm";
import {
  ChevronRight,
  FileText,
  Lock,
  Target,
  Timer,
} from "lucide-react";
import { db } from "@/db/client";
import { getCurrentUser } from "@/lib/currentUser";
import { hasFeature, isPro, MOCK_EXAM_DURATION_MIN } from "@/lib/plan";
import {
  getProgressByMisconception,
} from "@/server/queries/progress";
import { getDailyStats, getRecommendation } from "@/server/queries/history";
import { getRoadmap } from "@/server/queries/roadmap";
import { StudyPlan } from "@/components/dashboard/StudyPlan";
import { PaceCard } from "@/components/dashboard/PaceCard";
import { CategoryMastery } from "@/components/dashboard/CategoryMastery";
import { WeaknessTickets } from "@/components/dashboard/WeaknessTickets";
import { AdSlot } from "@/components/AdSlot";

export const dynamic = "force-dynamic";
export const metadata = { title: "分析ダッシュボード" };

const FREE_WEEKLY_TARGET = 35; // 5問/日 × 7日
const PRO_WEEKLY_TARGET = 70;

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const pro = isPro(user);
  const analyticsUnlocked = hasFeature(user, "advancedAnalytics");
  const mockExamUnlocked = hasFeature(user, "mockExam");
  const pdfUnlocked = hasFeature(user, "pdfExport");

  const [statsRow, daily, misc, roadmap, recommended] = await Promise.all([
    db.execute(sql`
      SELECT
        COUNT(*)::int AS total,
        SUM(CASE WHEN result = 'correct' THEN 1 ELSE 0 END)::int AS correct
      FROM attempts
      WHERE user_id = ${user.id} AND result IN ('correct', 'incorrect')
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

  const allTopicCount = roadmap.reduce((s, m) => s + m.topicCount, 0);
  const attemptedTopicCount = roadmap.reduce((s, m) => s + m.attemptedCount, 0);
  const coverage = allTopicCount ? attemptedTopicCount / allTopicCount : 0;

  const topMisconception = misc.find(
    (m) => m.attempted >= 2 && m.incorrectRate >= 0.3
  ) ?? null;

  const weeklyTarget = pro ? PRO_WEEKLY_TARGET : FREE_WEEKLY_TARGET;

  return (
    <div className="space-y-7 pb-10">
      {/* ── Header ─────────── */}
      <header className="space-y-1.5 pt-1">
        <div className="kicker">Progress Dashboard</div>
        <h1 className="text-ios-large font-semibold leading-[1.05] tracking-tight">
          分析
        </h1>
        <p className="text-[13.5px] text-muted-foreground">
          現在地と次にやるべきことを、ここに集約。
        </p>
      </header>

      {/* ── 1. Study plan: diagnosis + 3 next-step tickets ── */}
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

      {/* ── 2. Weekly pace + category mastery ── */}
      <section className="space-y-3">
        <SectionHead
          kicker="This Week"
          title="今週のペース"
          sub={`${pro ? "Pro" : "Free"} の目安は週 ${weeklyTarget}問`}
        />
        <PaceCard daily={daily} weeklyTarget={weeklyTarget} />
      </section>

      <section className="space-y-3">
        <SectionHead
          kicker="Mastery"
          title="3分野の習熟度"
          sub="正答率は 60% を合格ラインの目安に"
        />
        {analyticsUnlocked || total >= 5 ? (
          <CategoryMastery majors={roadmap} />
        ) : (
          <ProGate />
        )}
      </section>

      {/* ── 3. Top 3 weakness tickets ── */}
      <section className="space-y-3">
        <SectionHead
          kicker="Top Weaknesses"
          title="優先して潰す3つ"
          sub="誤答率の高い誤解パターンから、その場で5問セッション"
          rightHref="/misconceptions"
          rightLabel="すべて見る"
        />
        <WeaknessTickets items={misc} />
      </section>

      {/* ── 4. Tools ── */}
      <section className="space-y-3">
        <SectionHead kicker="Tools" title="その他" />
        <div className="grid gap-3 sm:grid-cols-3">
          <ToolCard
            href={
              mockExamUnlocked ? "/learn/mock-exam" : "/pricing?reason=mock_exam"
            }
            hue="#0A84FF"
            icon={Timer}
            kicker="Rehearsal"
            title={`模擬試験 ${MOCK_EXAM_DURATION_MIN}分`}
            desc="本番形式で力試し"
            locked={!mockExamUnlocked}
          />
          <ToolCard
            href={pdfUnlocked ? "/account/report" : "/pricing?reason=pdf_export"}
            hue="#34C759"
            icon={FileText}
            kicker="Report"
            title="学習レポートPDF"
            desc="累計・正答率・重点補強を1枚に"
            locked={!pdfUnlocked}
          />
          <ToolCard
            href="/learn/session/new?mode=weakness&count=5"
            hue="#AF52DE"
            icon={Target}
            kicker="Sharpen"
            title="弱点5問"
            desc="誤解パターン重み付きで自動抽出"
            locked={false}
          />
        </div>
      </section>
    </div>
  );
}

// ── Subcomponents ─────────────────────────────────────────────────────────

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
        <div className="kicker">{kicker}</div>
        <div className="mt-1 text-[19px] font-semibold tracking-tight">
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
        <div className="text-[15px] font-semibold">詳細分析は Pro で解放</div>
        <div className="text-[12px] text-muted-foreground">
          5問解くか、Proにすると分野別の習熟度が表示されます
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

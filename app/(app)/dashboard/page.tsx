import Link from "next/link";
import { sql } from "drizzle-orm";
import {
  ChevronRight,
  FileText,
  Lock,
  PlayCircle,
  Target,
  Timer,
  TrendingUp,
} from "lucide-react";
import { db } from "@/db/client";
import { getCurrentUser } from "@/lib/currentUser";
import { hasFeature, isPro, MOCK_EXAM_DURATION_MIN } from "@/lib/plan";
import {
  getProgressByMisconception,
  getProgressByTopic,
} from "@/server/queries/progress";
import { getDailyStats } from "@/server/queries/history";
import { MisconceptionHeatmap } from "@/components/dashboard/MisconceptionHeatmap";
import { TopicHeatmap } from "@/components/dashboard/TopicHeatmap";
import { DailySparkline } from "@/components/dashboard/DailySparkline";
import { AdSlot } from "@/components/AdSlot";

export const dynamic = "force-dynamic";
export const metadata = { title: "分析ダッシュボード" };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const pro = isPro(user);
  const analyticsUnlocked = hasFeature(user, "advancedAnalytics");
  const mockExamUnlocked = hasFeature(user, "mockExam");
  const pdfUnlocked = hasFeature(user, "pdfExport");

  const [statsRow, daily, misc, topic] = await Promise.all([
    db.execute(sql`
      SELECT
        COUNT(*)::int AS total,
        COALESCE(AVG(NULLIF(duration_ms, 0)), 0)::int AS avg_ms
      FROM attempts
      WHERE user_id = ${user.id} AND result IN ('correct', 'incorrect')
    `),
    getDailyStats(user.id, 14),
    analyticsUnlocked ? getProgressByMisconception(user.id) : Promise.resolve([]),
    analyticsUnlocked ? getProgressByTopic(user.id) : Promise.resolve([]),
  ]);

  const stats = (statsRow.rows[0] ?? {}) as {
    total?: number;
    avg_ms?: number;
  };
  const total = Number(stats.total ?? 0);
  const avgSec = Math.round(Number(stats.avg_ms ?? 0) / 1000);

  // Daily sparkline — compute 14-day trend slope for editorial caption.
  const lastHalf = daily.slice(-7);
  const firstHalf = daily.slice(0, Math.max(0, daily.length - 7));
  const avg = (xs: typeof daily) =>
    xs.length === 0 ? 0 : xs.reduce((s, d) => s + d.rate, 0) / xs.length;
  const deltaPct = Math.round((avg(lastHalf) - avg(firstHalf)) * 100);

  return (
    <div className="space-y-8 pb-10">
      {/* ── Editorial header ─────────── */}
      <header className="flex items-end justify-between gap-3 pt-1">
        <div className="space-y-1.5">
          <div className="kicker">Progress Dashboard</div>
          <h1 className="text-ios-large font-semibold leading-[1.05] tracking-tight">
            分析
          </h1>
          <p className="text-[13.5px] text-muted-foreground">
            どこでズレているか、ひと目で。
          </p>
        </div>
        <Link
          href="/learn/session/new?mode=weakness&count=5"
          className="inline-flex h-10 items-center gap-1 rounded-full bg-foreground px-4 text-[13.5px] font-semibold text-background shadow-ios active:opacity-90"
        >
          弱点5問
          <PlayCircle className="h-4 w-4" />
        </Link>
      </header>

      {!pro && <AdSlot variant="banner" />}

      {/* ── 14-day sparkline + scalar metadata ── */}
      <section className="space-y-3">
        <SectionHead
          kicker="Trend"
          title="14日の推移"
          sub={
            total > 0
              ? `累計 ${total}問${avgSec > 0 ? ` · 平均 ${avgSec}秒/問` : ""}`
              : "解いた問題が増えるほど精度が上がります"
          }
          right={
            total > 0 ? (
              <span
                className={`num inline-flex items-center gap-1 text-[12px] font-semibold ${
                  deltaPct > 0
                    ? "text-ios-green"
                    : deltaPct < 0
                      ? "text-ios-red"
                      : "text-muted-foreground"
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                {deltaPct > 0 ? "+" : ""}
                {deltaPct}
                <span className="text-[10px] font-medium text-muted-foreground">
                  pt vs 前週
                </span>
              </span>
            ) : (
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            )
          }
        />
        <div className="surface-card p-5">
          <DailySparkline data={daily} />
        </div>
      </section>

      {/* ── Heatmaps ── */}
      <ProGate
        unlocked={analyticsUnlocked}
        kicker="Trap Heatmap"
        title="誤解パターン別ヒートマップ"
        desc="赤いほど誤答率が高い『敵』"
      >
        <div className="surface-card p-5">
          <MisconceptionHeatmap items={misc} />
        </div>
      </ProGate>

      <ProGate
        unlocked={analyticsUnlocked}
        kicker="Topic Heatmap"
        title="論点別ヒートマップ"
        desc="緑が押さえた論点・赤は補強対象"
      >
        <div className="surface-card p-5">
          <TopicHeatmap items={topic} />
        </div>
      </ProGate>

      {/* ── Tools ── */}
      <section className="space-y-3">
        <SectionHead kicker="Tools" title="次の一手" />
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
  right,
}: {
  kicker: string;
  title: string;
  sub?: string;
  right?: React.ReactNode;
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
      {right}
    </div>
  );
}

function ProGate({
  unlocked,
  kicker,
  title,
  desc,
  children,
}: {
  unlocked: boolean;
  kicker: string;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  if (unlocked) {
    return (
      <section className="space-y-3">
        <SectionHead kicker={kicker} title={title} sub={desc} />
        {children}
      </section>
    );
  }
  return (
    <section className="space-y-3">
      <SectionHead kicker={kicker} title={title} sub={desc} />
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
            弱点の深掘りと学習経路の推薦で合格までの距離を短縮
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </Link>
    </section>
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

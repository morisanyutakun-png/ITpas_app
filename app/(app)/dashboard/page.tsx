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
import {
  getProgressByMisconception,
  getProgressByTopic,
} from "@/server/queries/progress";
import {
  getDailyStats,
  getRecommendation,
} from "@/server/queries/history";
import { MisconceptionHeatmap } from "@/components/dashboard/MisconceptionHeatmap";
import { TopicHeatmap } from "@/components/dashboard/TopicHeatmap";
import { DailySparkline } from "@/components/dashboard/DailySparkline";
import { AdSlot } from "@/components/AdSlot";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const pro = isPro(user);
  const analyticsUnlocked = hasFeature(user, "advancedAnalytics");
  const mockExamUnlocked = hasFeature(user, "mockExam");
  const pdfUnlocked = hasFeature(user, "pdfExport");

  const [statsRow, daily, rec, misc, topic] = await Promise.all([
    db.execute(sql`
      SELECT
        COUNT(*)::int AS total,
        SUM(CASE WHEN result = 'correct' THEN 1 ELSE 0 END)::int AS correct
      FROM attempts
      WHERE user_id = ${user.id}
    `),
    getDailyStats(user.id, 14),
    getRecommendation(user.id),
    analyticsUnlocked ? getProgressByMisconception(user.id) : Promise.resolve([]),
    analyticsUnlocked ? getProgressByTopic(user.id) : Promise.resolve([]),
  ]);

  const stats = (statsRow.rows[0] ?? {}) as { total?: number; correct?: number };
  const total = Number(stats.total ?? 0);
  const correct = Number(stats.correct ?? 0);
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const topEnemy = misc[0];

  // Accuracy ring geometry (SVG).
  const ringSize = 128;
  const stroke = 10;
  const r = (ringSize - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ - (accuracy / 100) * circ;

  return (
    <div className="space-y-7">
      {/* Large title */}
      <header className="flex items-end justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            Progress
          </div>
          <h1 className="mt-1.5 text-ios-large font-semibold">分析</h1>
          <p className="mt-1 text-[14px] text-muted-foreground">
            あなたの『どこでズレているか』をひと目で。
          </p>
        </div>
        <Link
          href="/learn/session/new?mode=weakness&count=5"
          className="pill-primary h-10 gap-1 px-4 text-[13.5px]"
        >
          弱点5問
        </Link>
      </header>

      {/* Hero: accuracy ring */}
      <section className="relative overflow-hidden rounded-3xl bg-grad-ink p-6 text-white shadow-hero">
        <div className="relative z-10 flex items-center gap-6">
          <div className="relative shrink-0">
            <svg width={ringSize} height={ringSize} className="-rotate-90">
              <defs>
                <linearGradient id="ringGrad" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#30D158" />
                  <stop offset="100%" stopColor="#00C7BE" />
                </linearGradient>
              </defs>
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={r}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth={stroke}
                fill="none"
              />
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={r}
                stroke="url(#ringGrad)"
                strokeWidth={stroke}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={total > 0 ? dashOffset : circ}
                className="transition-[stroke-dashoffset] duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="num text-[30px] font-semibold leading-none">
                {total > 0 ? accuracy : 0}
                <span className="ml-0.5 text-[14px] font-medium opacity-70">%</span>
              </div>
              <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] opacity-70">
                正答率
              </div>
            </div>
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-70">
                累計回答
              </div>
              <div className="num mt-0.5 text-[26px] font-semibold tracking-tight">
                {total}
                <span className="ml-1 text-[13px] font-medium opacity-70">問</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-70">
                最大の敵
              </div>
              <div className="mt-0.5 truncate text-[15px] font-semibold">
                {analyticsUnlocked && topEnemy
                  ? `${topEnemy.title} (${Math.round(topEnemy.incorrectRate * 100)}%)`
                  : analyticsUnlocked
                  ? "—"
                  : "Proで解放"}
              </div>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-primary/30 blur-3xl" />
      </section>

      {!pro && <AdSlot variant="banner" />}

      {/* Recommendation */}
      {rec && (
        <Link
          href={`/learn/session/new?mode=topic&topic=${rec.slug}&count=5`}
          className="surface-card flex items-center gap-4 p-4 transition-transform active:scale-[0.99]"
        >
          <span className="tile-icon bg-grad-orange">
            <Flame className="h-5 w-5" strokeWidth={2.4} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ios-orange">
              次に学ぶべき — {rec.reason}
            </div>
            <div className="truncate text-[16px] font-semibold">{rec.title}</div>
            {rec.attempted > 0 && (
              <div className="text-[11.5px] text-muted-foreground">
                これまでの正答率 {Math.round(rec.correctRate * 100)}% ({rec.attempted}問)
              </div>
            )}
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Link>
      )}

      {/* Daily sparkline */}
      <section className="space-y-2">
        <div className="flex items-end justify-between px-1">
          <div>
            <div className="section-title text-ios-blue">14日の推移</div>
            <div className="text-[15px] font-semibold tracking-tight">
              継続がいちばんの武器
            </div>
          </div>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="surface-card p-5">
          <DailySparkline data={daily} />
        </div>
      </section>

      {/* Misconception heatmap */}
      <ProGate
        unlocked={analyticsUnlocked}
        title="誤解パターン別ヒートマップ"
        desc="赤いほど誤答率が高い『敵』"
        accentTile="bg-grad-sunset"
      >
        <div className="surface-card p-5">
          <MisconceptionHeatmap items={misc} />
        </div>
      </ProGate>

      {/* Topic heatmap */}
      <ProGate
        unlocked={analyticsUnlocked}
        title="論点別ヒートマップ"
        desc="緑が押さえた論点・赤は補強対象"
        accentTile="bg-grad-green"
      >
        <div className="surface-card p-5">
          <TopicHeatmap items={topic} />
        </div>
      </ProGate>

      {/* Quick actions */}
      <section className="space-y-2">
        <div className="ios-section-label">ツール</div>
        <div className="ios-list">
          <ActionRow
            icon={Timer}
            tile="bg-grad-ocean"
            title={`模擬試験 ${MOCK_EXAM_DURATION_MIN}分`}
            desc="本番形式で力試し"
            href={mockExamUnlocked ? "/learn/mock-exam" : "/pricing?reason=mock_exam"}
            locked={!mockExamUnlocked}
          />
          <ActionRow
            icon={FileText}
            tile="bg-grad-green"
            title="学習レポートをPDFに"
            desc="累計・正答率・重点補強を1枚に"
            href={pdfUnlocked ? "/account/report" : "/pricing?reason=pdf_export"}
            locked={!pdfUnlocked}
          />
          <ActionRow
            icon={Target}
            tile="bg-grad-purple"
            title="弱点5問にすぐ挑む"
            desc="誤解パターン重み付きで自動抽出"
            href="/learn/session/new?mode=weakness&count=5"
            locked={false}
          />
        </div>
      </section>
    </div>
  );
}

function ProGate({
  unlocked,
  title,
  desc,
  accentTile,
  children,
}: {
  unlocked: boolean;
  title: string;
  desc: string;
  accentTile: string;
  children: React.ReactNode;
}) {
  if (unlocked) {
    return (
      <section className="space-y-2">
        <div className="px-1">
          <div className="text-[17px] font-semibold tracking-tight">{title}</div>
          <div className="text-[12.5px] text-muted-foreground">{desc}</div>
        </div>
        {children}
      </section>
    );
  }
  return (
    <section className="space-y-2">
      <div className="px-1">
        <div className="text-[17px] font-semibold tracking-tight">{title}</div>
        <div className="text-[12.5px] text-muted-foreground">{desc}</div>
      </div>
      <Link
        href="/pricing?reason=advanced_analytics"
        className="surface-card flex items-center gap-4 p-5 transition-transform active:scale-[0.99]"
      >
        <span className={`tile-icon ${accentTile} opacity-80`}>
          <Lock className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[15.5px] font-semibold">詳細分析は Pro で解放</div>
          <div className="text-[12.5px] text-muted-foreground">
            弱点の深掘りと学習経路の推薦で合格までの距離を短縮
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </Link>
    </section>
  );
}

function ActionRow({
  icon: Icon,
  tile,
  title,
  desc,
  href,
  locked,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  tile: string;
  title: string;
  desc: string;
  href: string;
  locked: boolean;
}) {
  return (
    <Link href={href} className="ios-row active:bg-muted/60">
      <span className={`tile-icon-sm ${tile}`}>
        <Icon className="h-4 w-4" strokeWidth={2.4} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[15px] font-semibold">{title}</span>
          {locked && <Lock className="h-3 w-3 text-muted-foreground" />}
        </div>
        <div className="text-[12.5px] text-muted-foreground">{desc}</div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}

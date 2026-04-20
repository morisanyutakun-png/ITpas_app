import Link from "next/link";
import { sql } from "drizzle-orm";
import {
  ChevronRight,
  FileText,
  Flame,
  Lock,
  Target,
  Timer,
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

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-3 pt-2">
        <div>
          <h1 className="text-ios-title1 font-semibold">分析</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            あなたの『どこでズレているか』をひと目で。
          </p>
        </div>
        <Link
          href="/learn/session/new?mode=weakness&count=5"
          className="inline-flex h-9 items-center gap-1 rounded-full bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground active:opacity-80"
        >
          弱点5問
        </Link>
      </header>

      {/* Stat strip */}
      <section className="ios-list shadow-ios-sm">
        <div className="grid grid-cols-3 divide-x divide-border/60">
          <StatCell label="累計回答" value={total.toString()} unit="問" />
          <StatCell
            label="正答率"
            value={total > 0 ? `${accuracy}` : "—"}
            unit={total > 0 ? "%" : ""}
          />
          <StatCell
            label="最大の敵"
            value={
              analyticsUnlocked && topEnemy
                ? `${Math.round(topEnemy.incorrectRate * 100)}`
                : "—"
            }
            unit={analyticsUnlocked && topEnemy ? "%" : ""}
            sub={analyticsUnlocked ? topEnemy?.title : "Proで解放"}
          />
        </div>
      </section>

      {!pro && <AdSlot variant="banner" />}

      {/* Recommendation */}
      {rec && (
        <Link
          href={`/learn/session/new?mode=topic&topic=${rec.slug}&count=5`}
          className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-ios-sm active:opacity-70"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ios-orange/10 text-ios-orange">
            <Flame className="h-5 w-5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-medium text-muted-foreground">
              次に学ぶべき — {rec.reason}
            </div>
            <div className="truncate text-[15px] font-semibold">{rec.title}</div>
            {rec.attempted > 0 && (
              <div className="text-[11px] text-muted-foreground">
                これまでの正答率 {Math.round(rec.correctRate * 100)}% ({rec.attempted}問)
              </div>
            )}
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Link>
      )}

      {/* Daily sparkline */}
      <section className="space-y-2">
        <div className="ios-section-label">直近14日の学習量</div>
        <div className="rounded-2xl bg-card p-4 shadow-ios-sm">
          <DailySparkline data={daily} />
        </div>
      </section>

      {/* Misconception heatmap */}
      <ProGate
        unlocked={analyticsUnlocked}
        title="誤解パターン別ヒートマップ"
        desc="赤いほど誤答率が高い『敵』"
      >
        <div className="rounded-2xl bg-card p-4 shadow-ios-sm">
          <MisconceptionHeatmap items={misc} />
        </div>
      </ProGate>

      {/* Topic heatmap */}
      <ProGate
        unlocked={analyticsUnlocked}
        title="論点別ヒートマップ"
        desc="緑が押さえた論点・赤は補強対象"
      >
        <div className="rounded-2xl bg-card p-4 shadow-ios-sm">
          <TopicHeatmap items={topic} />
        </div>
      </ProGate>

      {/* Quick actions */}
      <section className="space-y-2">
        <div className="ios-section-label">ツール</div>
        <div className="ios-list shadow-ios-sm">
          <ActionRow
            icon={Timer}
            tint="text-ios-blue"
            title={`模擬試験 ${MOCK_EXAM_DURATION_MIN}分`}
            desc="本番形式で力試し"
            href={mockExamUnlocked ? "/learn/mock-exam" : "/pricing?reason=mock_exam"}
            locked={!mockExamUnlocked}
          />
          <ActionRow
            icon={FileText}
            tint="text-ios-green"
            title="学習レポートをPDFに"
            desc="累計・正答率・重点補強を1枚に"
            href={pdfUnlocked ? "/account/report" : "/pricing?reason=pdf_export"}
            locked={!pdfUnlocked}
          />
          <ActionRow
            icon={Target}
            tint="text-ios-purple"
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

function StatCell({
  label,
  value,
  unit,
  sub,
}: {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 px-2 py-4 text-center">
      <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </div>
      <div className="flex items-baseline gap-0.5">
        <span className="text-[22px] font-semibold tabular-nums">{value}</span>
        {unit && (
          <span className="text-[12px] text-muted-foreground">{unit}</span>
        )}
      </div>
      {sub && (
        <div className="line-clamp-1 max-w-[10ch] text-[10px] text-muted-foreground">
          {sub}
        </div>
      )}
    </div>
  );
}

function ProGate({
  unlocked,
  title,
  desc,
  children,
}: {
  unlocked: boolean;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  if (unlocked) {
    return (
      <section className="space-y-2">
        <div className="px-1">
          <div className="text-ios-headline font-semibold">{title}</div>
          <div className="text-[12px] text-muted-foreground">{desc}</div>
        </div>
        {children}
      </section>
    );
  }
  return (
    <section className="space-y-2">
      <div className="px-1">
        <div className="text-ios-headline font-semibold">{title}</div>
        <div className="text-[12px] text-muted-foreground">{desc}</div>
      </div>
      <Link
        href="/pricing?reason=advanced_analytics"
        className="flex items-center gap-3 rounded-2xl bg-card p-5 shadow-ios-sm active:opacity-70"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Lock className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-semibold">詳細分析はProで解放</div>
          <div className="text-[12px] text-muted-foreground">
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
  tint,
  title,
  desc,
  href,
  locked,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  tint: string;
  title: string;
  desc: string;
  href: string;
  locked: boolean;
}) {
  return (
    <Link href={href} className="ios-row group active:bg-muted/60">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
        <Icon className={`h-4 w-4 ${tint}`} strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[15px] font-medium">{title}</span>
          {locked && <Lock className="h-3 w-3 text-muted-foreground" />}
        </div>
        <div className="text-[12px] text-muted-foreground">{desc}</div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}

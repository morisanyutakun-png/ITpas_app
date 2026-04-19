import Link from "next/link";
import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { getOrCreateAnonUser } from "@/lib/anonId";
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
import { ArrowRight, Compass, Flame, Target, Trophy, type LucideIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getOrCreateAnonUser();
  const [misc, topic, statsRow, daily, rec] = await Promise.all([
    getProgressByMisconception(user.id),
    getProgressByTopic(user.id),
    db.execute(sql`
      SELECT
        COUNT(*)::int AS total,
        SUM(CASE WHEN result = 'correct' THEN 1 ELSE 0 END)::int AS correct
      FROM attempts
      WHERE user_id = ${user.id}
    `),
    getDailyStats(user.id, 14),
    getRecommendation(user.id),
  ]);

  const stats = (statsRow.rows[0] ?? {}) as { total?: number; correct?: number };
  const total = Number(stats.total ?? 0);
  const correct = Number(stats.correct ?? 0);
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const topEnemy = misc[0];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">理解ダッシュボード</h1>
          <p className="text-sm text-slate-600">
            あなたの『どこでズレているか』『何を伸ばすべきか』をひと目で。
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/history"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
          >
            学習履歴
          </Link>
          <Link
            href="/learn/session/new?mode=weakness&count=5"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white shadow-lg transition hover:bg-slate-800 hover:shadow-xl"
          >
            弱点5問
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Top stat row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard icon={Target} tone="violet" label="累計回答数" value={total.toString()} />
        <StatCard
          icon={Trophy}
          tone="emerald"
          label="正答率"
          value={`${accuracy}%`}
          sub={total > 0 ? `${correct} / ${total}` : "—"}
        />
        <StatCard
          icon={Flame}
          tone="rose"
          label="最大の敵"
          value={topEnemy ? `${Math.round(topEnemy.incorrectRate * 100)}%` : "—"}
          sub={topEnemy?.title}
          fullWidthOnMobile
        />
      </div>

      {/* Recommendation */}
      {rec && (
        <div className="rounded-2xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow">
              <Compass className="h-6 w-6" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold uppercase tracking-wider text-violet-700">
                次に学ぶべき論点 — {rec.reason}
              </div>
              <div className="text-lg font-bold text-slate-900 mt-0.5">{rec.title}</div>
              {rec.attempted > 0 && (
                <div className="text-xs text-slate-600">
                  これまでの正答率 {Math.round(rec.correctRate * 100)}% ({rec.attempted}問挑戦)
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <Link
                href={`/topics/${rec.slug}`}
                className="inline-flex items-center gap-1 rounded-lg bg-white border-2 border-violet-200 px-3 py-1.5 text-xs font-bold text-violet-800 hover:border-violet-400"
              >
                論点を見る
              </Link>
              <Link
                href={`/learn/session/new?mode=topic&topic=${rec.slug}&count=5`}
                className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-violet-700"
              >
                5問解く →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Sparkline */}
      <DailySparkline data={daily} />

      {/* Misconception heatmap */}
      <section className="space-y-3">
        <SectionHeader
          title="誤解パターン別ヒートマップ"
          desc="赤いほど誤答率が高い『敵』。クリックで詳細＆対策へ。"
        />
        <MisconceptionHeatmap items={misc} />
      </section>

      {/* Topic heatmap */}
      <section className="space-y-3">
        <SectionHeader
          title="論点別ヒートマップ"
          desc="緑が押さえた論点。赤は補強対象。"
        />
        <TopicHeatmap items={topic} />
      </section>
    </div>
  );
}

function SectionHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div>
      <h2 className="text-lg md:text-xl font-bold tracking-tight">{title}</h2>
      <p className="text-xs text-slate-600">{desc}</p>
    </div>
  );
}

function StatCard({
  icon: Icon,
  tone,
  label,
  value,
  sub,
  fullWidthOnMobile,
}: {
  icon: LucideIcon;
  tone: "violet" | "emerald" | "rose";
  label: string;
  value: string;
  sub?: string;
  fullWidthOnMobile?: boolean;
}) {
  const palette = {
    violet: { bg: "bg-violet-100", text: "text-violet-700" },
    emerald: { bg: "bg-emerald-100", text: "text-emerald-700" },
    rose: { bg: "bg-rose-100", text: "text-rose-700" },
  }[tone];
  return (
    <div
      className={`rounded-2xl border bg-white p-4 shadow-sm ${
        fullWidthOnMobile ? "col-span-2 md:col-span-1" : ""
      }`}
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
        <span className={`flex h-6 w-6 items-center justify-center rounded-md ${palette.bg} ${palette.text}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-2xl md:text-3xl font-black tracking-tight">{value}</div>
        {sub && <div className="text-xs text-slate-500 line-clamp-1">{sub}</div>}
      </div>
    </div>
  );
}

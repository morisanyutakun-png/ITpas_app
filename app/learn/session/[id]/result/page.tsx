import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { sessions } from "@/db/schema";
import { getOrCreateAnonUser } from "@/lib/anonId";
import { finishSessionAction } from "@/server/actions/sessions";
import { ArrowRight, Skull, Sparkles, Trophy } from "lucide-react";

export const dynamic = "force-dynamic";

function rankFor(rate: number) {
  if (rate >= 1) return { rank: "S", grad: "from-amber-400 via-yellow-300 to-amber-500", line: "PERFECT!" };
  if (rate >= 0.8) return { rank: "A", grad: "from-emerald-400 to-teal-500", line: "強い。" };
  if (rate >= 0.6) return { rank: "B", grad: "from-sky-400 to-cyan-500", line: "あと一歩。" };
  if (rate >= 0.4) return { rank: "C", grad: "from-violet-400 to-fuchsia-500", line: "理解の補正タイム。" };
  return { rank: "D", grad: "from-rose-500 to-pink-500", line: "ここからが本番。" };
}

export default async function SessionResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getOrCreateAnonUser();
  const s = await db.query.sessions.findFirst({ where: eq(sessions.id, id) });
  if (!s || s.userId !== user.id) notFound();

  if (!s.finishedAt) {
    await finishSessionAction(id);
  }

  const breakdown = await db.execute(sql`
    SELECT
      m.slug AS slug,
      m.title AS title,
      SUM(CASE WHEN a.result = 'incorrect' THEN 1 ELSE 0 END)::int AS incorrect,
      COUNT(*)::int AS attempted
    FROM attempts a
    JOIN question_misconceptions qm ON qm.question_id = a.question_id
    JOIN misconceptions m ON m.id = qm.misconception_id
    WHERE a.session_id = ${id}
    GROUP BY m.slug, m.title
    ORDER BY incorrect DESC
  `);

  const refreshed = await db.query.sessions.findFirst({
    where: eq(sessions.id, id),
  });
  const total = refreshed?.totalCount ?? 0;
  const correct = refreshed?.correctCount ?? 0;
  const rate = total ? correct / total : 0;
  const pct = Math.round(rate * 100);
  const rank = rankFor(rate);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Hero rank reveal */}
      <div className="relative overflow-hidden rounded-3xl border-2 shadow-xl">
        <div className={`bg-gradient-to-br ${rank.grad} px-6 py-10 text-white`}>
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.3em] text-white/80">
              SESSION CLEAR
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="text-7xl md:text-8xl font-black drop-shadow-lg leading-none">
                {rank.rank}
              </div>
              <Sparkles className="h-8 w-8 text-yellow-200" />
            </div>
            <div className="text-lg font-bold">{rank.line}</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl md:text-4xl font-black">
                {correct}
              </span>
              <span className="text-lg opacity-80">/ {total}</span>
              <span className="text-2xl font-bold opacity-90">({pct}%)</span>
            </div>
            <div className="mt-1 text-xs uppercase tracking-wider text-white/70">
              {s.mode} mode
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Skull className="h-4 w-4 text-rose-600" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            このセッションで出会った敵
          </h3>
        </div>
        {breakdown.rows.length === 0 ? (
          <p className="text-sm text-slate-600">記録がありません。</p>
        ) : (
          <div className="space-y-2">
            {breakdown.rows.map((r) => {
              const row = r as {
                slug?: string;
                title?: string;
                incorrect?: number;
                attempted?: number;
              };
              const inc = Number(row.incorrect ?? 0);
              const att = Number(row.attempted ?? 0);
              const perc = att ? Math.round((inc / att) * 100) : 0;
              return (
                <div
                  key={String(row.slug)}
                  className="flex items-center gap-3 rounded-xl border-2 border-slate-100 p-3 transition hover:border-amber-300"
                >
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/misconceptions/${row.slug}`}
                      className="font-semibold text-sm text-slate-900 hover:underline truncate block"
                    >
                      {row.title}
                    </Link>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${
                          inc === 0
                            ? "bg-emerald-400"
                            : "bg-gradient-to-r from-amber-400 to-rose-500"
                        }`}
                        style={{ width: `${Math.max(8, perc)}%` }}
                      />
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className={`text-sm font-black ${inc === 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {inc}/{att}
                    </div>
                    <Link
                      href={`/learn/session/new?mode=weakness&misconception=${row.slug}&count=5`}
                      className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900"
                    >
                      5問挑む →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/learn/session/new?mode=weakness&count=5"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white shadow-lg transition hover:bg-slate-800 hover:shadow-xl"
        >
          弱点5問にもう一度挑む
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:border-slate-400"
        >
          <Trophy className="h-4 w-4" />
          ダッシュボードへ
        </Link>
      </div>
    </div>
  );
}

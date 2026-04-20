import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { ArrowRight, BarChart3 } from "lucide-react";
import { db } from "@/db/client";
import { sessions } from "@/db/schema";
import { getOrCreateAnonUser } from "@/lib/anonId";
import { finishSessionAction } from "@/server/actions/sessions";

export const dynamic = "force-dynamic";

const MODE_LABEL: Record<string, string> = {
  weakness: "弱点",
  topic: "論点",
  year: "年度別",
  format: "形式別",
  mixed: "模擬試験",
};

function rankFor(rate: number) {
  if (rate >= 1) return { rank: "S", tint: "text-ios-yellow", line: "完璧" };
  if (rate >= 0.8) return { rank: "A", tint: "text-ios-green", line: "強い" };
  if (rate >= 0.6) return { rank: "B", tint: "text-ios-blue", line: "あと一歩" };
  if (rate >= 0.4) return { rank: "C", tint: "text-ios-purple", line: "理解の補正タイム" };
  return { rank: "D", tint: "text-ios-red", line: "ここからが本番" };
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

  if (!s.finishedAt) await finishSessionAction(id);

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
    <div className="mx-auto max-w-2xl space-y-5">
      <section className="rounded-3xl bg-card p-6 text-center shadow-ios-sm">
        <div className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
          セッション終了 · {MODE_LABEL[s.mode] ?? s.mode}
        </div>
        <div className={`mt-3 text-[72px] font-semibold leading-none tracking-tight ${rank.tint}`}>
          {rank.rank}
        </div>
        <div className="mt-2 text-[15px] text-muted-foreground">{rank.line}</div>
        <div className="mt-4 flex items-baseline justify-center gap-1.5">
          <span className="text-[34px] font-semibold tabular-nums">
            {correct}
          </span>
          <span className="text-[17px] text-muted-foreground">
            / {total}
          </span>
          <span className="ml-2 text-[22px] font-semibold tabular-nums">
            {pct}%
          </span>
        </div>
      </section>

      <section className="space-y-2">
        <div className="ios-section-label">このセッションで出会った誤解パターン</div>
        {breakdown.rows.length === 0 ? (
          <div className="rounded-2xl bg-card p-5 text-[13px] text-muted-foreground shadow-ios-sm">
            記録がありません。
          </div>
        ) : (
          <div className="ios-list shadow-ios-sm">
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
                <div key={String(row.slug)} className="ios-row">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/misconceptions/${row.slug}`}
                      className="truncate text-[14px] font-medium active:opacity-70"
                    >
                      {row.title}
                    </Link>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full ${
                            inc === 0 ? "bg-ios-green" : "bg-ios-red"
                          }`}
                          style={{ width: `${Math.max(6, perc)}%` }}
                        />
                      </div>
                      <span
                        className={`text-[11px] font-semibold tabular-nums ${
                          inc === 0 ? "text-ios-green" : "text-ios-red"
                        }`}
                      >
                        {inc}/{att}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/learn/session/new?mode=weakness&misconception=${row.slug}&count=5`}
                    className="ml-2 shrink-0 rounded-full bg-muted px-3 py-1 text-[11px] font-semibold text-foreground active:opacity-70"
                  >
                    5問
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="flex flex-col gap-2 md:flex-row">
        <Link
          href="/learn/session/new?mode=weakness&count=5"
          className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary text-[15px] font-semibold text-primary-foreground active:opacity-80"
        >
          弱点5問に再挑戦
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full bg-muted px-5 text-[15px] font-semibold text-foreground active:opacity-80"
        >
          <BarChart3 className="h-4 w-4" />
          分析を見る
        </Link>
      </div>
    </div>
  );
}

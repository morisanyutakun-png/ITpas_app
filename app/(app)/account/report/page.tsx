import Link from "next/link";
import { Crown, Lock, Printer } from "lucide-react";
import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { readCurrentUser } from "@/lib/currentUser";
import { hasFeature, planLabel } from "@/lib/plan";
import {
  getProgressByMisconception,
  getProgressByTopic,
} from "@/server/queries/progress";
import { getDailyStats } from "@/server/queries/history";
import { PrintButtonClient } from "@/components/account/PrintButtonClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "学習レポート (PDF)" };

/**
 * Printable learning report. Browsers "Save as PDF" converts it to a PDF.
 * Server-gated by the `pdfExport` feature flag.
 */
export default async function ReportPage() {
  const user = await readCurrentUser();

  if (!user?.isSignedIn) {
    return (
      <UpgradeShell
        title="ログインが必要です"
        body="学習レポートを出力するにはGoogleログインしてください。"
        href={`/api/auth/google/login?returnTo=${encodeURIComponent("/account/report")}`}
        cta="Googleでログイン"
      />
    );
  }

  if (!hasFeature(user, "pdfExport")) {
    return (
      <UpgradeShell
        title="PDF書き出しはProプラン以上で解放されます"
        body="弱点レポートと学習履歴を1枚のPDFに出力できます。印刷して紙でも復習可能。"
        href="/pricing?reason=pdf_export"
        cta="Proを見る"
      />
    );
  }

  const [misc, topic, daily, totalsRow] = await Promise.all([
    getProgressByMisconception(user.id),
    getProgressByTopic(user.id),
    getDailyStats(user.id, 30),
    db.execute(sql`
      SELECT COUNT(*)::int AS total,
             SUM(CASE WHEN result = 'correct' THEN 1 ELSE 0 END)::int AS correct
      FROM attempts WHERE user_id = ${user.id}
    `),
  ]);
  const totals = (totalsRow.rows[0] ?? {}) as { total?: number; correct?: number };
  const total = Number(totals.total ?? 0);
  const correct = Number(totals.correct ?? 0);
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  const worstMisc = [...misc]
    .filter((m) => m.attempted >= 2)
    .sort((a, b) => b.incorrectRate - a.incorrectRate)
    .slice(0, 5);
  const strongTopics = [...topic]
    .filter((t) => t.attempted >= 2)
    .sort((a, b) => b.correctRate - a.correctRate)
    .slice(0, 5);
  const weakTopics = [...topic]
    .filter((t) => t.attempted >= 2)
    .sort((a, b) => a.correctRate - b.correctRate)
    .slice(0, 5);

  const today = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="no-print mb-4 flex items-center justify-between gap-3 rounded-xl border-2 border-slate-200 bg-white p-3">
        <div className="text-xs text-slate-600">
          ブラウザのメニューから <strong>印刷 → PDFとして保存</strong> を選ぶと、このページがPDFに書き出されます。
        </div>
        <PrintButtonClient />
      </div>

      <article className="print-root rounded-2xl border-2 border-slate-200 bg-white p-8 space-y-6">
        <header className="flex items-end justify-between border-b pb-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              理解ノート — 学習レポート
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              {user.displayName ?? user.email ?? "学習者"}さんの現在地
            </h1>
          </div>
          <div className="text-right text-xs text-slate-500">
            <div>発行日: {today}</div>
            <div>プラン: {planLabel(user.plan)}</div>
          </div>
        </header>

        <section className="grid grid-cols-3 gap-3">
          <Stat label="累計回答" value={total.toString()} />
          <Stat label="正解数" value={correct.toString()} />
          <Stat label="正答率" value={`${accuracy}%`} />
        </section>

        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            直近30日の学習量
          </h2>
          <div className="mt-2 overflow-hidden rounded-lg border">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-3 py-1.5 text-left font-semibold">日付</th>
                  <th className="px-3 py-1.5 text-right font-semibold">回答数</th>
                  <th className="px-3 py-1.5 text-right font-semibold">正解</th>
                  <th className="px-3 py-1.5 text-right font-semibold">正答率</th>
                </tr>
              </thead>
              <tbody>
                {daily.length === 0 ? (
                  <tr>
                    <td className="px-3 py-4 text-center text-slate-400" colSpan={4}>
                      まだ記録がありません
                    </td>
                  </tr>
                ) : (
                  daily.map((d) => (
                    <tr key={d.day} className="border-t">
                      <td className="px-3 py-1.5">{d.day}</td>
                      <td className="px-3 py-1.5 text-right">{d.total}</td>
                      <td className="px-3 py-1.5 text-right">{d.correct}</td>
                      <td className="px-3 py-1.5 text-right">
                        {Math.round(d.rate * 100)}%
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            重点補強すべき誤解パターン
          </h2>
          {worstMisc.length === 0 ? (
            <p className="mt-2 text-xs text-slate-500">
              まだ分析に十分なデータがありません。もう少し解いてから再発行してください。
            </p>
          ) : (
            <ol className="mt-2 space-y-1">
              {worstMisc.map((m) => (
                <li
                  key={m.slug}
                  className="flex items-center justify-between rounded-lg border bg-rose-50 px-3 py-2 text-sm"
                >
                  <span className="font-semibold">{m.title}</span>
                  <span className="text-xs text-rose-700">
                    誤答率 {Math.round(m.incorrectRate * 100)}% ({m.attempted}問)
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="grid md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              押さえた論点
            </h2>
            <ul className="mt-2 space-y-1">
              {strongTopics.map((t) => (
                <li
                  key={t.slug}
                  className="flex items-center justify-between rounded-lg border bg-emerald-50 px-3 py-1.5 text-xs"
                >
                  <span className="font-semibold">{t.title}</span>
                  <span className="text-emerald-700">
                    {Math.round(t.correctRate * 100)}%
                  </span>
                </li>
              ))}
              {strongTopics.length === 0 && (
                <li className="text-xs text-slate-500">記録なし</li>
              )}
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              弱い論点
            </h2>
            <ul className="mt-2 space-y-1">
              {weakTopics.map((t) => (
                <li
                  key={t.slug}
                  className="flex items-center justify-between rounded-lg border bg-rose-50 px-3 py-1.5 text-xs"
                >
                  <span className="font-semibold">{t.title}</span>
                  <span className="text-rose-700">
                    {Math.round(t.correctRate * 100)}%
                  </span>
                </li>
              ))}
              {weakTopics.length === 0 && (
                <li className="text-xs text-slate-500">記録なし</li>
              )}
            </ul>
          </div>
        </section>

        <footer className="border-t pt-3 text-[10px] text-slate-500">
          ITパスポート試験の問題はIPAの著作物です。本レポートは学習目的の個人用分析です。
        </footer>
      </article>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-root { border: none !important; box-shadow: none !important; padding: 0 !important; }
          header, footer { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-slate-50 p-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-2xl font-black">{value}</div>
    </div>
  );
}

function UpgradeShell({
  title,
  body,
  href,
  cta,
}: {
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="mx-auto max-w-md rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-white p-8 text-center space-y-3">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
        <Lock className="h-6 w-6" />
      </div>
      <h1 className="text-lg font-bold">{title}</h1>
      <p className="text-sm text-slate-600">{body}</p>
      <Link
        href={href}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 font-bold text-white shadow-lg"
      >
        {cta.includes("Premium") ? <Crown className="h-4 w-4" /> : <Printer className="h-4 w-4" />}
        {cta}
      </Link>
    </div>
  );
}


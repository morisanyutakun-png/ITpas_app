import Link from "next/link";
import { Check, X, MinusCircle, Clock } from "lucide-react";
import { getOrCreateAnonUser } from "@/lib/anonId";
import { getRecentHistory } from "@/server/queries/history";
import { pickFormat, pickMajor } from "@/lib/design";

export const dynamic = "force-dynamic";
export const metadata = { title: "学習履歴" };

export default async function HistoryPage() {
  const user = await getOrCreateAnonUser();
  const rows = await getRecentHistory(user.id, 100);

  const total = rows.filter((r) => r.result !== "skipped").length;
  const correct = rows.filter((r) => r.result === "correct").length;
  const avgMs =
    rows.length > 0
      ? Math.round(rows.reduce((s, r) => s + r.durationMs, 0) / rows.length)
      : 0;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">学習履歴</h1>
        <p className="text-sm text-slate-600">直近100問の解答記録（匿名）</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <SummaryCard label="総解答数" value={`${total}`} />
        <SummaryCard
          label="正答率"
          value={total > 0 ? `${Math.round((correct / total) * 100)}%` : "—"}
          sub={total > 0 ? `${correct} / ${total}` : ""}
        />
        <SummaryCard label="平均回答時間" value={`${(avgMs / 1000).toFixed(1)}秒`} />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center text-sm text-slate-600">
          まだ解答記録がありません。
          <Link href="/learn/questions" className="block mt-2 text-violet-700 underline">
            問題を解きにいく →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => {
            const major = pickMajor(r.majorCategory);
            const fmt = pickFormat(r.formatType);
            const FmtIcon = fmt.icon;
            const dt = new Date(r.createdAt);
            return (
              <Link
                key={r.attemptId}
                href={`/learn/questions/${r.questionId}`}
                className="group flex gap-3 rounded-xl border-2 border-slate-100 bg-white p-3 transition hover:border-slate-300 hover:shadow-sm"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    r.result === "correct"
                      ? "bg-emerald-100 text-emerald-700"
                      : r.result === "incorrect"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {r.result === "correct" ? (
                    <Check className="h-5 w-5" strokeWidth={3} />
                  ) : r.result === "incorrect" ? (
                    <X className="h-5 w-5" strokeWidth={3} />
                  ) : (
                    <MinusCircle className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <span className={`inline-flex items-center rounded border px-1.5 py-0 text-[10px] font-semibold ${major.chip}`}>
                      {major.label}
                    </span>
                    <span className="inline-flex items-center gap-0.5 rounded border border-slate-200 bg-slate-50 px-1.5 py-0 text-[10px] text-slate-700">
                      <FmtIcon className={`h-3 w-3 ${fmt.color}`} />
                      {fmt.label}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      R{r.examYear} #{r.questionNumber}
                    </span>
                    <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-slate-500">
                      <Clock className="h-3 w-3" />
                      {(r.durationMs / 1000).toFixed(1)}s
                    </span>
                  </div>
                  <p className="text-sm text-slate-800 line-clamp-1">{r.stem}</p>
                  <div className="mt-0.5 text-[10px] text-slate-500">
                    {dt.toLocaleString("ja-JP", { dateStyle: "medium", timeStyle: "short" })}
                    {r.selectedChoiceLabel && (
                      <span className="ml-2">
                        選択: <span className="font-bold">{r.selectedChoiceLabel}</span>
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <div className="text-xl md:text-2xl font-black">{value}</div>
        {sub && <div className="text-[11px] text-slate-500">{sub}</div>}
      </div>
    </div>
  );
}

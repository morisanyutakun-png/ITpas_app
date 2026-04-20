import Link from "next/link";
import { Check, ChevronRight, Clock, MinusCircle, X } from "lucide-react";
import { getOrCreateAnonUser } from "@/lib/anonId";
import { getRecentHistory } from "@/server/queries/history";

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
    <div className="space-y-5">
      <header className="pt-2">
        <h1 className="text-ios-title1 font-semibold">学習履歴</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          直近100問の解答記録
        </p>
      </header>

      <section className="ios-list shadow-ios-sm">
        <div className="grid grid-cols-3 divide-x divide-border/60">
          <Summary label="総解答" value={`${total}`} unit="問" />
          <Summary
            label="正答率"
            value={total > 0 ? `${Math.round((correct / total) * 100)}` : "—"}
            unit={total > 0 ? "%" : ""}
          />
          <Summary
            label="平均回答"
            value={`${(avgMs / 1000).toFixed(1)}`}
            unit="秒"
          />
        </div>
      </section>

      {rows.length === 0 ? (
        <div className="rounded-2xl bg-card p-8 text-center shadow-ios-sm">
          <div className="text-[15px] font-medium">まだ解答記録がありません</div>
          <Link
            href="/learn/questions"
            className="mt-3 inline-flex h-10 items-center rounded-full bg-primary px-4 text-[14px] font-semibold text-primary-foreground active:opacity-80"
          >
            問題を解きに行く
          </Link>
        </div>
      ) : (
        <div className="ios-list shadow-ios-sm">
          {rows.map((r) => {
            const dt = new Date(r.createdAt);
            return (
              <Link
                key={r.attemptId}
                href={`/learn/questions/${r.questionId}`}
                className="ios-row items-start active:bg-muted/60"
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    r.result === "correct"
                      ? "bg-ios-green/10 text-ios-green"
                      : r.result === "incorrect"
                      ? "bg-ios-red/10 text-ios-red"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {r.result === "correct" ? (
                    <Check className="h-4 w-4" strokeWidth={3} />
                  ) : r.result === "incorrect" ? (
                    <X className="h-4 w-4" strokeWidth={3} />
                  ) : (
                    <MinusCircle className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span>
                      R{r.examYear} #{r.questionNumber}
                    </span>
                    <span className="ml-auto flex items-center gap-0.5">
                      <Clock className="h-3 w-3" />
                      {(r.durationMs / 1000).toFixed(1)}s
                    </span>
                  </div>
                  <p className="line-clamp-1 text-[14px]">{r.stem}</p>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    {dt.toLocaleString("ja-JP", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Summary({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 px-2 py-4 text-center">
      <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </div>
      <div className="flex items-baseline gap-0.5">
        <span className="text-[20px] font-semibold tabular-nums">{value}</span>
        {unit && (
          <span className="text-[12px] text-muted-foreground">{unit}</span>
        )}
      </div>
    </div>
  );
}

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { MisconceptionProgress } from "@/server/queries/progress";

function toneFor(rate: number) {
  if (rate >= 0.6) return { text: "text-ios-red", bar: "bg-ios-red" };
  if (rate >= 0.4) return { text: "text-ios-orange", bar: "bg-ios-orange" };
  if (rate >= 0.2) return { text: "text-ios-yellow", bar: "bg-ios-yellow" };
  return { text: "text-ios-green", bar: "bg-ios-green" };
}

export function MisconceptionHeatmap({
  items,
}: {
  items: MisconceptionProgress[];
}) {
  if (items.length === 0) {
    return (
      <div className="p-6 text-center text-[13px] text-muted-foreground">
        まだ十分な解答がありません。何問か解くとここに誤解パターンが現れます。
      </div>
    );
  }
  return (
    <div className="divide-y divide-border/60">
      {items.map((m) => {
        const t = toneFor(m.incorrectRate);
        const pct = Math.round(m.incorrectRate * 100);
        return (
          <Link
            key={m.slug}
            href={`/misconceptions/${m.slug}`}
            className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 active:opacity-70"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate text-[14px] font-medium">{m.title}</div>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full ${t.bar}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className={`text-[11px] font-semibold tabular-nums ${t.text}`}>
                  {pct}%
                </span>
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  {m.incorrect}/{m.attempted}
                </span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        );
      })}
    </div>
  );
}

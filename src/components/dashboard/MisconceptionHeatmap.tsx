import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { MisconceptionProgress } from "@/server/queries/progress";

function toneFor(rate: number) {
  if (rate >= 0.6)
    return { text: "text-ios-red", bar: "bg-gradient-to-r from-[#FF6B4A] to-[#FF3B30]" };
  if (rate >= 0.4)
    return { text: "text-ios-orange", bar: "bg-gradient-to-r from-[#FFB23A] to-[#FF9500]" };
  if (rate >= 0.2)
    return { text: "text-ios-yellow", bar: "bg-gradient-to-r from-[#FFD94A] to-[#FFCC00]" };
  return { text: "text-ios-green", bar: "bg-gradient-to-r from-[#30D158] to-[#00C7BE]" };
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
            className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 transition-opacity active:opacity-60"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate text-[14.5px] font-medium">{m.title}</div>
              <div className="mt-1.5 flex items-center gap-2.5">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${t.bar} transition-[width] duration-500 ease-out`}
                    style={{ width: `${Math.max(pct, 4)}%` }}
                  />
                </div>
                <span className={`num text-[12px] font-semibold ${t.text}`}>
                  {pct}%
                </span>
                <span className="num text-[11px] text-muted-foreground">
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

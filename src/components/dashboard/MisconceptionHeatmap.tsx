import Link from "next/link";
import type { MisconceptionProgress } from "@/server/queries/progress";

function colorFor(rate: number, attempted: number) {
  if (attempted === 0) return "bg-muted";
  if (rate >= 0.6) return "bg-rose-500 text-white";
  if (rate >= 0.4) return "bg-amber-400";
  if (rate >= 0.2) return "bg-amber-200";
  return "bg-emerald-400 text-white";
}

export function MisconceptionHeatmap({ items }: { items: MisconceptionProgress[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        まだ十分な解答がありません。何問か解くと、誤解パターン別に色がつきます。
      </p>
    );
  }
  return (
    <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
      {items.map((m) => (
        <Link key={m.slug} href={`/misconceptions/${m.slug}`}>
          <div
            className={`rounded-md p-3 text-sm border ${colorFor(m.incorrectRate, m.attempted)}`}
          >
            <div className="font-medium line-clamp-1">{m.title}</div>
            <div className="text-xs opacity-80">
              {m.incorrect}/{m.attempted} 誤 ({Math.round(m.incorrectRate * 100)}%)
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

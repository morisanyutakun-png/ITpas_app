import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import type { MisconceptionProgress } from "@/server/queries/progress";

export function WeaknessTickets({
  items,
}: {
  items: MisconceptionProgress[];
}) {
  // Only "real" weaknesses: ≥2 attempts and incorrect-rate ≥ 30%.
  const ranked = items
    .filter((m) => m.attempted >= 2 && m.incorrectRate >= 0.3)
    .slice(0, 3);

  if (ranked.length === 0) {
    return (
      <div className="surface-card p-6 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-ios-green/12 text-ios-green">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div className="mt-3 text-[14px] font-medium">
          まだ顕著な誤解パターンはありません
        </div>
        <div className="mt-1 text-[12px] text-muted-foreground">
          解答数が増えると、ここに優先的に潰すべき敵が並びます。
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {ranked.map((m, i) => (
        <Card key={m.slug} item={m} rank={i + 1} />
      ))}
    </div>
  );
}

function Card({
  item,
  rank,
}: {
  item: MisconceptionProgress;
  rank: number;
}) {
  const pct = Math.round(item.incorrectRate * 100);
  const tone =
    item.incorrectRate >= 0.6
      ? "text-ios-red"
      : item.incorrectRate >= 0.4
        ? "text-ios-orange"
        : "text-ios-yellow";
  const barColor =
    item.incorrectRate >= 0.6
      ? "from-[#FF6B4A] to-[#FF3B30]"
      : item.incorrectRate >= 0.4
        ? "from-[#FFB23A] to-[#FF9500]"
        : "from-[#FFD94A] to-[#FFCC00]";

  return (
    <div className="surface-card flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <span
          className={`num inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-muted px-2 text-[12px] font-bold tracking-tight`}
        >
          #{rank}
        </span>
        <span className={`num text-[18px] font-semibold leading-none ${tone}`}>
          {pct}%
        </span>
      </div>
      <div className="flex-1">
        <Link
          href={`/misconceptions/${item.slug}`}
          className="block text-[14px] font-semibold leading-snug tracking-tight underline-offset-2 hover:underline"
        >
          {item.title}
        </Link>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-[width] duration-500`}
            style={{ width: `${Math.max(4, pct)}%` }}
          />
        </div>
        <div className="num mt-1 text-[10.5px] text-muted-foreground">
          誤答 {item.incorrect} / 全 {item.attempted}問
        </div>
      </div>
      <Link
        href={`/learn/session/new?mode=weakness&misconception=${item.slug}&count=5`}
        className="inline-flex h-9 items-center justify-center gap-1 rounded-full bg-foreground text-[12.5px] font-semibold text-background transition-transform active:scale-[0.98]"
      >
        5問で潰す
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

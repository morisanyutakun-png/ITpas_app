import Link from "next/link";
import type { TopicProgress } from "@/server/queries/progress";

const MAJOR_LABEL: Record<string, string> = {
  strategy: "ストラテジ",
  management: "マネジメント",
  technology: "テクノロジ",
};

function tintFor(rate: number, attempted: number) {
  if (attempted === 0)
    return { bg: "bg-muted", text: "text-muted-foreground", bar: "bg-ios-gray3" };
  if (rate < 0.4)
    return { bg: "bg-ios-red/10", text: "text-ios-red", bar: "bg-ios-red" };
  if (rate < 0.6)
    return {
      bg: "bg-ios-orange/10",
      text: "text-ios-orange",
      bar: "bg-ios-orange",
    };
  if (rate < 0.8)
    return {
      bg: "bg-ios-yellow/10",
      text: "text-ios-orange",
      bar: "bg-ios-yellow",
    };
  return { bg: "bg-ios-green/10", text: "text-ios-green", bar: "bg-ios-green" };
}

export function TopicHeatmap({ items }: { items: TopicProgress[] }) {
  if (items.length === 0) {
    return (
      <div className="p-6 text-center text-[13px] text-muted-foreground">
        まだ十分な解答がありません。
      </div>
    );
  }
  const grouped = items.reduce<Record<string, TopicProgress[]>>((acc, t) => {
    (acc[t.majorCategory] ||= []).push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([major, list]) => (
        <div key={major} className="space-y-2">
          <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {MAJOR_LABEL[major] ?? major}
          </div>
          <div className="divide-y divide-border/60">
            {list.map((t) => {
              const pct = Math.round(t.correctRate * 100);
              const tone = tintFor(t.correctRate, t.attempted);
              return (
                <Link
                  key={t.slug}
                  href={`/topics/${t.slug}`}
                  className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0 active:opacity-70"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-medium">
                      {t.title}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full ${tone.bar}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span
                        className={`text-[11px] font-semibold tabular-nums ${tone.text}`}
                      >
                        {t.attempted === 0 ? "—" : `${pct}%`}
                      </span>
                      <span className="text-[11px] text-muted-foreground tabular-nums">
                        {t.correct}/{t.attempted}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

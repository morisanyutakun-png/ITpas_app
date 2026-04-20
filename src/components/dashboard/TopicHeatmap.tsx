import Link from "next/link";
import type { TopicProgress } from "@/server/queries/progress";

const MAJOR_META: Record<string, { label: string; tint: string }> = {
  strategy:   { label: "ストラテジ",    tint: "text-ios-purple" },
  management: { label: "マネジメント", tint: "text-ios-blue"   },
  technology: { label: "テクノロジ",   tint: "text-ios-teal"   },
};

function tintFor(rate: number, attempted: number) {
  if (attempted === 0)
    return {
      text: "text-muted-foreground",
      bar: "bg-ios-gray3",
    };
  if (rate < 0.4)
    return {
      text: "text-ios-red",
      bar: "bg-gradient-to-r from-[#FF6B4A] to-[#FF3B30]",
    };
  if (rate < 0.6)
    return {
      text: "text-ios-orange",
      bar: "bg-gradient-to-r from-[#FFB23A] to-[#FF9500]",
    };
  if (rate < 0.8)
    return {
      text: "text-ios-orange",
      bar: "bg-gradient-to-r from-[#FFD94A] to-[#FFCC00]",
    };
  return {
    text: "text-ios-green",
    bar: "bg-gradient-to-r from-[#30D158] to-[#00C7BE]",
  };
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
    <div className="space-y-5">
      {Object.entries(grouped).map(([major, list]) => {
        const meta = MAJOR_META[major] ?? { label: major, tint: "text-foreground" };
        return (
          <div key={major} className="space-y-2">
            <div className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${meta.tint}`}>
              {meta.label}
            </div>
            <div className="divide-y divide-border/60">
              {list.map((t) => {
                const pct = Math.round(t.correctRate * 100);
                const tone = tintFor(t.correctRate, t.attempted);
                return (
                  <Link
                    key={t.slug}
                    href={`/topics/${t.slug}`}
                    className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0 transition-opacity active:opacity-60"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14.5px] font-medium">
                        {t.title}
                      </div>
                      <div className="mt-1.5 flex items-center gap-2.5">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full ${tone.bar} transition-[width] duration-500 ease-out`}
                            style={{ width: t.attempted === 0 ? 0 : `${Math.max(pct, 4)}%` }}
                          />
                        </div>
                        <span className={`num text-[12px] font-semibold ${tone.text}`}>
                          {t.attempted === 0 ? "—" : `${pct}%`}
                        </span>
                        <span className="num text-[11px] text-muted-foreground">
                          {t.correct}/{t.attempted}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

import Link from "next/link";
import type { TopicProgress } from "@/server/queries/progress";

const MAJOR_LABEL: Record<string, string> = {
  strategy: "ストラテジ系",
  management: "マネジメント系",
  technology: "テクノロジ系",
};

function colorFor(rate: number, attempted: number) {
  if (attempted === 0) return "bg-muted";
  if (rate < 0.4) return "bg-rose-500 text-white";
  if (rate < 0.6) return "bg-amber-400";
  if (rate < 0.8) return "bg-amber-200";
  return "bg-emerald-400 text-white";
}

export function TopicHeatmap({ items }: { items: TopicProgress[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        まだ十分な解答がありません。問題を解くと論点別に正答率が表示されます。
      </p>
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
          <div className="text-xs font-semibold text-muted-foreground">
            {MAJOR_LABEL[major] ?? major}
          </div>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            {list.map((t) => (
              <Link key={t.slug} href={`/topics/${t.slug}`}>
                <div
                  className={`rounded-md p-3 text-sm border ${colorFor(t.correctRate, t.attempted)}`}
                >
                  <div className="font-medium line-clamp-1">{t.title}</div>
                  <div className="text-xs opacity-80">
                    {t.correct}/{t.attempted} 正答 ({Math.round(t.correctRate * 100)}%)
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

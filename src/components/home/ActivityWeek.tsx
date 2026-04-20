import type { DailyStat } from "@/server/queries/history";

const DOW = ["日", "月", "火", "水", "木", "金", "土"];

/**
 * Compact 7-day activity strip — one column per day, height proportional to
 * question count, tinted by accuracy. Apple Health–style bar chart.
 */
export function ActivityWeek({ data }: { data: DailyStat[] }) {
  // Build a map keyed by YYYY-MM-DD in JST.
  const by: Record<string, DailyStat> = Object.fromEntries(
    data.map((d) => [d.day, d])
  );
  const nowJst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const days: Array<{
    key: string;
    dow: string;
    total: number;
    rate: number;
    isToday: boolean;
  }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(nowJst.getTime() - i * 86_400_000);
    const key = fmt(d);
    const row = by[key];
    days.push({
      key,
      dow: DOW[d.getUTCDay()],
      total: row?.total ?? 0,
      rate: row?.rate ?? 0,
      isToday: i === 0,
    });
  }

  const max = Math.max(1, ...days.map((d) => d.total));
  const totalThisWeek = days.reduce((s, d) => s + d.total, 0);
  const activeDays = days.filter((d) => d.total > 0).length;

  return (
    <div className="flex h-full flex-col justify-between gap-3">
      <div className="flex items-baseline justify-between">
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          直近7日
        </div>
        <div className="text-[10.5px] text-muted-foreground">
          <span className="num font-medium text-foreground">{totalThisWeek}</span>
          問 ·{" "}
          <span className="num font-medium text-foreground">{activeDays}</span>
          日学習
        </div>
      </div>

      <div className="flex h-[64px] items-end gap-1.5">
        {days.map((d) => {
          const h = d.total === 0 ? 6 : 10 + (d.total / max) * 54;
          const color =
            d.total === 0
              ? "bg-muted"
              : d.rate >= 0.7
              ? "bg-ios-green"
              : d.rate >= 0.5
              ? "bg-ios-orange"
              : "bg-ios-red";
          return (
            <div
              key={d.key}
              className="flex flex-1 flex-col items-center gap-1"
            >
              <div
                className={`w-full rounded-t-md ${color} ${
                  d.isToday ? "ring-2 ring-offset-2 ring-offset-card ring-primary/30" : ""
                } transition-all`}
                style={{ height: h }}
                title={`${d.key} · ${d.total}問 · ${Math.round(d.rate * 100)}%`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-1.5">
        {days.map((d) => (
          <div
            key={d.key}
            className={`flex-1 text-center text-[9.5px] font-medium ${
              d.isToday ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {d.dow}
          </div>
        ))}
      </div>
    </div>
  );
}

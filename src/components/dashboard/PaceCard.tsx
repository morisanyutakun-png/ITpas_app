import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { DailyStat } from "@/server/queries/history";

export type PaceCardProps = {
  /** Most recent 14 days of attempts (oldest → newest). */
  daily: DailyStat[];
  /** Weekly target (questions / week). */
  weeklyTarget: number;
};

/**
 * Dense weekly-pace card. Replaces the sparkline.
 * Shows: this-week count, vs last-week delta, target line, last-7-day bars.
 */
export function PaceCard({ daily, weeklyTarget }: PaceCardProps) {
  const last7 = daily.slice(-7);
  const prev7 = daily.slice(-14, -7);
  const thisWeek = last7.reduce((s, d) => s + d.total, 0);
  const lastWeek = prev7.reduce((s, d) => s + d.total, 0);
  const delta = thisWeek - lastWeek;
  const goalPct = Math.min(100, Math.round((thisWeek / weeklyTarget) * 100));
  const remaining = Math.max(0, weeklyTarget - thisWeek);

  // Pad last7 to exactly 7 days so the bar chart always has 7 columns.
  const days7: DailyStat[] = Array.from({ length: 7 }, (_, i) => {
    const ref = new Date();
    ref.setUTCHours(ref.getUTCHours() + 9); // JST
    ref.setUTCDate(ref.getUTCDate() - (6 - i));
    const ymd = ref.toISOString().slice(0, 10);
    return last7.find((d) => d.day === ymd) ?? { day: ymd, total: 0, correct: 0, rate: 0 };
  });
  const dayLabels = ["日", "月", "火", "水", "木", "金", "土"];
  const todayJst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const todayYmd = todayJst.toISOString().slice(0, 10);

  const maxBarVal = Math.max(weeklyTarget / 7, ...days7.map((d) => d.total), 1);
  const targetPerDay = weeklyTarget / 7;
  const targetY = Math.round((1 - targetPerDay / maxBarVal) * 100);

  return (
    <section className="surface-card relative p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <div className="kicker">Weekly Pace</div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="num text-[36px] font-semibold leading-none tracking-tight">
              {thisWeek}
            </span>
            <span className="text-[12.5px] text-muted-foreground">
              / 目標 {weeklyTarget}問
            </span>
          </div>
        </div>
        <DeltaChip delta={delta} />
      </div>

      <div className="mt-3 flex items-center gap-2 text-[11.5px]">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#0A84FF] to-[#5E5CE6] transition-[width] duration-500"
            style={{ width: `${Math.max(2, goalPct)}%` }}
          />
        </div>
        <span className="num font-medium text-muted-foreground">
          {goalPct}%
        </span>
      </div>
      <div className="mt-1 text-[11.5px] text-muted-foreground">
        {remaining === 0
          ? "今週の目標を達成。次週もこのペースで。"
          : `目標まで あと ${remaining}問`}
      </div>

      {/* 7-day bar chart with target dotted line. */}
      <div className="mt-5">
        <div
          className="relative grid grid-cols-7 gap-1.5"
          style={{ height: 96 }}
        >
          {/* target line */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 border-t border-dashed border-ios-blue/40"
            style={{ top: `${targetY}%` }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 -translate-y-1/2 rounded-md bg-ios-blue/10 px-1.5 py-px text-[9.5px] font-semibold uppercase tracking-wider text-ios-blue"
            style={{ top: `${targetY}%` }}
          >
            目標 {Math.round(targetPerDay * 10) / 10}/日
          </div>
          {days7.map((d, i) => {
            const h = Math.max(2, Math.round((d.total / maxBarVal) * 100));
            const isToday = d.day === todayYmd;
            const dt = new Date(`${d.day}T00:00:00+09:00`);
            const dow = dayLabels[dt.getUTCDay()];
            return (
              <div key={d.day} className="flex flex-col items-stretch justify-end">
                <div className="relative flex flex-1 items-end">
                  <div
                    className={`mx-auto w-full rounded-t-md transition-all duration-500 ${
                      d.total === 0
                        ? "bg-muted"
                        : isToday
                          ? "bg-gradient-to-t from-[#5E5CE6] to-[#0A84FF]"
                          : "bg-foreground/75"
                    }`}
                    style={{ height: `${h}%` }}
                    title={`${d.day} — ${d.total}問 (${Math.round(d.rate * 100)}%)`}
                  />
                </div>
                <div
                  className={`mt-1 text-center text-[10px] tabular-nums ${
                    isToday
                      ? "font-semibold text-ios-blue"
                      : "text-muted-foreground"
                  }`}
                >
                  {dow}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function DeltaChip({ delta }: { delta: number }) {
  if (delta === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11.5px] font-semibold text-muted-foreground">
        <Minus className="h-3 w-3" />
        前週比 0
      </span>
    );
  }
  const positive = delta > 0;
  return (
    <span
      className={`num inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${
        positive
          ? "bg-ios-green/10 text-ios-green"
          : "bg-ios-red/10 text-ios-red"
      }`}
    >
      {positive ? (
        <ArrowUpRight className="h-3 w-3" />
      ) : (
        <ArrowDownRight className="h-3 w-3" />
      )}
      {positive ? "+" : ""}
      {delta} 前週比
    </span>
  );
}

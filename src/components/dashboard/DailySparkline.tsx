import type { DailyStat } from "@/server/queries/history";

export function DailySparkline({ data }: { data: DailyStat[] }) {
  if (data.length === 0) {
    return (
      <div className="p-6 text-center text-[13px] text-muted-foreground">
        過去14日の解答記録がありません。
      </div>
    );
  }

  const W = 600;
  const H = 120;
  const PAD_X = 24;
  const PAD_Y = 18;
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_Y * 2;
  const maxTotal = Math.max(...data.map((d) => d.total), 1);

  const points = data.map((d, i) => {
    const x = PAD_X + (i / Math.max(1, data.length - 1)) * innerW;
    const y = PAD_Y + (1 - d.rate) * innerH;
    return { x, y, ...d };
  });

  // Smooth curve through points via midpoint-anchored cubic bezier.
  const linePath = points
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = points[i - 1];
      const mx = (prev.x + p.x) / 2;
      return `C ${mx} ${prev.y}, ${mx} ${p.y}, ${p.x} ${p.y}`;
    })
    .join(" ");
  const last = points[points.length - 1];
  const first = points[0];
  const areaPath = `${linePath} L ${last.x} ${H - PAD_Y} L ${first.x} ${H - PAD_Y} Z`;

  return (
    <div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          正答率の推移
        </span>
        <span className="num text-muted-foreground">
          {data.length}日・累計 {data.reduce((s, d) => s + d.total, 0)}問
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 h-auto w-full">
        <defs>
          <linearGradient id="sparkArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#0A84FF" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#0A84FF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="sparkLine" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#5E5CE6" />
            <stop offset="100%" stopColor="#0A84FF" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((g) => (
          <line
            key={g}
            x1={PAD_X}
            x2={W - PAD_X}
            y1={PAD_Y + (1 - g) * innerH}
            y2={PAD_Y + (1 - g) * innerH}
            stroke="hsl(var(--border))"
            strokeDasharray="2 4"
          />
        ))}
        {[0, 50, 100].map((g) => (
          <text
            key={g}
            x={4}
            y={PAD_Y + (1 - g / 100) * innerH + 3}
            fontSize="9"
            fill="hsl(var(--muted-foreground))"
          >
            {g}%
          </text>
        ))}
        <path d={areaPath} fill="url(#sparkArea)" />
        <path
          d={linePath}
          fill="none"
          stroke="url(#sparkLine)"
          strokeWidth="2.4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((p) => (
          <g key={p.day}>
            <circle
              cx={p.x}
              cy={p.y}
              r={Math.max(2.5, Math.min(6, 2 + (p.total / maxTotal) * 4))}
              fill={
                p.rate >= 0.7 ? "#34C759" : p.rate >= 0.5 ? "#FF9500" : "#FF3B30"
              }
              stroke="hsl(var(--card))"
              strokeWidth="2"
            >
              <title>
                {p.day} — {p.correct}/{p.total} ({Math.round(p.rate * 100)}%)
              </title>
            </circle>
          </g>
        ))}
      </svg>
    </div>
  );
}

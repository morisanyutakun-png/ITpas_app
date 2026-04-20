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
  const H = 100;
  const PAD = 20;
  const innerW = W - PAD * 2;
  const innerH = H - PAD * 2;
  const maxTotal = Math.max(...data.map((d) => d.total), 1);

  const points = data.map((d, i) => {
    const x = PAD + (i / Math.max(1, data.length - 1)) * innerW;
    const y = PAD + (1 - d.rate) * innerH;
    return { x, y, ...d };
  });

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  return (
    <div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-medium uppercase tracking-[0.08em] text-muted-foreground">
          正答率の推移
        </span>
        <span className="text-muted-foreground">
          {data.length}日・累計 {data.reduce((s, d) => s + d.total, 0)}問
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 h-auto w-full">
        {[0, 0.5, 1].map((g) => (
          <line
            key={g}
            x1={PAD}
            x2={W - PAD}
            y1={PAD + (1 - g) * innerH}
            y2={PAD + (1 - g) * innerH}
            stroke="hsl(var(--border))"
            strokeDasharray="2 3"
          />
        ))}
        {[0, 50, 100].map((g) => (
          <text
            key={g}
            x={4}
            y={PAD + (1 - g / 100) * innerH + 3}
            fontSize="9"
            fill="hsl(var(--muted-foreground))"
          >
            {g}%
          </text>
        ))}
        <path
          d={path}
          fill="none"
          stroke="#007AFF"
          strokeWidth="2"
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
              strokeWidth="1.5"
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

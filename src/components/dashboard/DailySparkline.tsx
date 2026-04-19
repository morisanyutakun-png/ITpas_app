import type { DailyStat } from "@/server/queries/history";

export function DailySparkline({ data }: { data: DailyStat[] }) {
  if (data.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center text-sm text-slate-600">
        過去14日の解答記録がありません。問題を解くとここに正答率の推移が出ます。
      </div>
    );
  }

  const W = 600;
  const H = 120;
  const PAD = 24;
  const innerW = W - PAD * 2;
  const innerH = H - PAD * 2;
  const maxTotal = Math.max(...data.map((d) => d.total), 1);

  // Pad x-axis to consistent positions even if days have gaps
  const points = data.map((d, i) => {
    const x = PAD + (i / Math.max(1, data.length - 1)) * innerW;
    const y = PAD + (1 - d.rate) * innerH;
    return { x, y, ...d };
  });

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            過去14日の正答率推移
          </div>
          <div className="text-sm text-slate-700">
            点の大きさ = その日の解答数
          </div>
        </div>
        <div className="text-xs text-slate-500">
          {data.length}日 / 累計{data.reduce((s, d) => s + d.total, 0)}問
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {/* gridlines */}
        {[0, 0.5, 1].map((g) => (
          <line
            key={g}
            x1={PAD}
            x2={W - PAD}
            y1={PAD + (1 - g) * innerH}
            y2={PAD + (1 - g) * innerH}
            stroke="#e2e8f0"
            strokeDasharray="3 3"
          />
        ))}
        {/* y-axis labels */}
        {[0, 50, 100].map((g) => (
          <text
            key={g}
            x={4}
            y={PAD + (1 - g / 100) * innerH + 4}
            fontSize="10"
            fill="#94a3b8"
          >
            {g}%
          </text>
        ))}
        {/* line */}
        <path d={path} fill="none" stroke="#8b5cf6" strokeWidth="2" />
        {/* points */}
        {points.map((p) => (
          <g key={p.day}>
            <circle
              cx={p.x}
              cy={p.y}
              r={Math.max(3, Math.min(8, 2 + (p.total / maxTotal) * 6))}
              fill={p.rate >= 0.7 ? "#10b981" : p.rate >= 0.5 ? "#f59e0b" : "#f43f5e"}
              stroke="white"
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

export function AccuracyRing({
  percent,
  size = 96,
  thickness = 8,
  label,
  sub,
}: {
  percent: number | null;
  size?: number;
  thickness?: number;
  label?: string;
  sub?: string;
}) {
  const p = percent ?? 0;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const dash = (p / 100) * c;
  const color =
    p >= 70 ? "#34C759" : p >= 50 ? "#FF9500" : p === 0 ? "#C7C7CC" : "#FF3B30";
  return (
    <div
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={thickness}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          style={{ transition: "stroke-dasharray 600ms ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="num text-[22px] font-semibold leading-none tracking-tight">
            {percent === null ? "—" : Math.round(p)}
            {percent !== null && (
              <span className="ml-0.5 text-[10px] font-medium text-muted-foreground">
                %
              </span>
            )}
          </div>
          {label && (
            <div className="mt-0.5 text-[9.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {label}
            </div>
          )}
          {sub && (
            <div className="text-[9px] text-muted-foreground">{sub}</div>
          )}
        </div>
      </div>
    </div>
  );
}

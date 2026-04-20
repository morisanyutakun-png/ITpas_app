const MODE_META: Record<string, { label: string; accent: string }> = {
  weakness: { label: "弱点",     accent: "text-ios-red"    },
  topic:    { label: "論点",     accent: "text-ios-teal"   },
  year:     { label: "年度別",   accent: "text-ios-blue"   },
  format:   { label: "形式別",   accent: "text-ios-purple" },
  mixed:    { label: "模擬試験", accent: "text-ios-orange" },
};

export function SessionProgressBar({
  step,
  total,
  mode,
}: {
  step: number;
  total: number;
  mode: string;
}) {
  const pct = Math.min(100, Math.round((step / total) * 100));
  const meta = MODE_META[mode] ?? { label: mode, accent: "text-foreground" };
  return (
    <div className="surface-card px-4 py-3.5">
      <div className="mb-2 flex items-center justify-between text-[12px]">
        <span className={`inline-flex items-center gap-1.5 font-semibold ${meta.accent}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {meta.label}
        </span>
        <span className="num font-semibold">
          <span className="text-foreground">{step}</span>
          <span className="mx-1 text-muted-foreground">/</span>
          <span className="text-muted-foreground">{total}</span>
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#5E5CE6] to-[#0A84FF] transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

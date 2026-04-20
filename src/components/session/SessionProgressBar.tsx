const MODE_LABEL: Record<string, string> = {
  weakness: "弱点",
  topic: "論点",
  year: "年度別",
  format: "形式別",
  mixed: "模擬試験",
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
  const label = MODE_LABEL[mode] ?? mode;
  return (
    <div className="rounded-2xl bg-card px-4 py-3 shadow-ios-sm">
      <div className="mb-2 flex items-center justify-between text-[12px]">
        <span className="rounded-full bg-muted px-2 py-0.5 font-medium text-muted-foreground">
          {label}
        </span>
        <span className="font-semibold tabular-nums">
          {step} / {total}
        </span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

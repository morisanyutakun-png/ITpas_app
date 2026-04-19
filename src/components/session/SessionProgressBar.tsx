export function SessionProgressBar({
  step,
  total,
  mode,
}: {
  step: number;
  total: number;
  mode: string;
}) {
  const pct = Math.min(100, Math.round(((step - 1) / total) * 100));
  return (
    <div className="rounded-2xl border bg-white px-5 py-4 shadow-sm">
      <div className="flex items-center justify-between mb-2 text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-2.5 py-0.5 font-bold uppercase tracking-wider text-violet-700">
          {mode} mode
        </span>
        <span className="font-bold text-slate-700">
          {step} / {total}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-400 transition-all duration-500"
          style={{ width: `${pct + 100 / total}%` }}
        />
      </div>
    </div>
  );
}

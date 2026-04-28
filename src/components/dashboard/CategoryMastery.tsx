import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { RoadmapMajor } from "@/server/queries/roadmap";

const MAJOR_HUE: Record<RoadmapMajor["major"], string> = {
  strategy: "#FF375F",
  management: "#FF9500",
  technology: "#0A84FF",
};

type Row = {
  major: RoadmapMajor["major"];
  label: string;
  attempted: number;
  correct: number;
  accuracy: number; // 0-1
  coverage: number; // 0-1 (touched topics / total topics)
  topicCount: number;
  attemptedCount: number;
};

function aggregate(majors: RoadmapMajor[]): Row[] {
  return majors.map((m) => {
    const allTopics = m.minors.flatMap((mi) => mi.topics);
    const attempted = allTopics.reduce((s, t) => s + t.attempted, 0);
    const correct = allTopics.reduce((s, t) => s + t.correct, 0);
    return {
      major: m.major,
      label: m.label,
      attempted,
      correct,
      accuracy: attempted ? correct / attempted : 0,
      coverage: m.topicCount ? m.attemptedCount / m.topicCount : 0,
      topicCount: m.topicCount,
      attemptedCount: m.attemptedCount,
    };
  });
}

export function CategoryMastery({ majors }: { majors: RoadmapMajor[] }) {
  const rows = aggregate(majors);
  const anyAttempted = rows.some((r) => r.attempted > 0);

  return (
    <div className="surface-card p-5 sm:p-6">
      <div className="space-y-5">
        {rows.map((r) => (
          <CategoryRow key={r.major} row={r} cold={!anyAttempted} />
        ))}
      </div>
    </div>
  );
}

function CategoryRow({ row, cold }: { row: Row; cold: boolean }) {
  const hue = MAJOR_HUE[row.major];
  const accuracyPct = Math.round(row.accuracy * 100);
  const coveragePct = Math.round(row.coverage * 100);
  const accuracyTone =
    row.attempted === 0
      ? "text-muted-foreground"
      : row.accuracy >= 0.7
        ? "text-ios-green"
        : row.accuracy >= 0.6
          ? "text-ios-orange"
          : "text-ios-red";

  return (
    <Link
      href={`/topics#${row.major}`}
      className="group block transition-opacity active:opacity-70"
    >
      <div className="flex items-baseline justify-between">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: hue }}
          />
          <span className="text-[14.5px] font-semibold tracking-tight">
            {row.label}
          </span>
        </div>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-3">
        <Metric
          label="正答率"
          valueClass={accuracyTone}
          valueText={
            row.attempted === 0 ? "—" : `${accuracyPct}%`
          }
          subText={
            row.attempted === 0
              ? "未挑戦"
              : `${row.correct} / ${row.attempted}問`
          }
          barFillPct={row.attempted === 0 ? 0 : accuracyPct}
          barColor={hue}
          showTarget
          targetPct={60}
          targetLabel="合格ライン"
          cold={cold}
        />
        <Metric
          label="カバー率"
          valueClass="text-foreground"
          valueText={`${coveragePct}%`}
          subText={`${row.attemptedCount} / ${row.topicCount}論点`}
          barFillPct={coveragePct}
          barColor={hue}
          cold={cold}
        />
      </div>
    </Link>
  );
}

function Metric({
  label,
  valueClass,
  valueText,
  subText,
  barFillPct,
  barColor,
  showTarget,
  targetPct,
  targetLabel,
  cold,
}: {
  label: string;
  valueClass: string;
  valueText: string;
  subText: string;
  barFillPct: number;
  barColor: string;
  showTarget?: boolean;
  targetPct?: number;
  targetLabel?: string;
  cold?: boolean;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </span>
        <span className={`num text-[14px] font-semibold ${valueClass}`}>
          {valueText}
        </span>
      </div>
      <div className="relative mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500"
          style={{
            width: `${Math.max(2, Math.min(100, barFillPct))}%`,
            background: cold
              ? "hsl(var(--muted-foreground) / 0.2)"
              : barColor,
          }}
        />
        {showTarget && targetPct !== undefined && (
          <div
            aria-hidden
            className="absolute inset-y-0 w-px bg-foreground/40"
            style={{ left: `${targetPct}%` }}
          />
        )}
      </div>
      <div className="mt-1 flex items-baseline justify-between text-[10.5px] text-muted-foreground">
        <span>{subText}</span>
        {showTarget && targetLabel && (
          <span className="text-[10px] uppercase tracking-wider">
            {targetLabel} {targetPct}%
          </span>
        )}
      </div>
    </div>
  );
}

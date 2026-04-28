import { ArrowRight } from "lucide-react";
import type { StudyFigure } from "@/lib/contentSchema";

// Single source of truth for figure accent colors. The schema only allows
// these four buckets so the visual stays calm — authors can't reach for an
// arbitrary hex that clashes with the rest of the design system.
const ACCENT: Record<
  "primary" | "warm" | "cool" | "neutral",
  { bg: string; ring: string; text: string; soft: string; chip: string }
> = {
  primary: {
    bg: "bg-[#0A84FF]",
    ring: "ring-[#0A84FF]/30",
    text: "text-[#0A84FF]",
    soft: "bg-[#0A84FF]/8",
    chip: "bg-[#0A84FF]/10 text-[#0A84FF] ring-1 ring-inset ring-[#0A84FF]/20",
  },
  warm: {
    bg: "bg-[#FF9500]",
    ring: "ring-[#FF9500]/30",
    text: "text-[#FF9500]",
    soft: "bg-[#FF9500]/8",
    chip: "bg-[#FF9500]/10 text-[#FF9500] ring-1 ring-inset ring-[#FF9500]/20",
  },
  cool: {
    bg: "bg-[#34C759]",
    ring: "ring-[#34C759]/30",
    text: "text-[#34C759]",
    soft: "bg-[#34C759]/8",
    chip: "bg-[#34C759]/10 text-[#34C759] ring-1 ring-inset ring-[#34C759]/20",
  },
  neutral: {
    bg: "bg-muted-foreground",
    ring: "ring-border",
    text: "text-muted-foreground",
    soft: "bg-muted",
    chip: "bg-muted text-muted-foreground ring-1 ring-inset ring-border",
  },
};

/**
 * Renders a typed lesson figure. The four supported figure kinds were
 * chosen to cover ~90% of IT Passport diagrams without giving authors
 * arbitrary canvas — that way every lesson reads like the same textbook.
 */
export function StudyFigureView({ figure }: { figure: StudyFigure }) {
  if (figure.kind === "layered") return <LayeredFigure figure={figure} />;
  if (figure.kind === "compare") return <CompareFigure figure={figure} />;
  if (figure.kind === "flow") return <FlowFigure figure={figure} />;
  return <QuadrantFigure figure={figure} />;
}

function LayeredFigure({
  figure,
}: {
  figure: Extract<StudyFigure, { kind: "layered" }>;
}) {
  // Authors author bottom-up; render top-down so the diagram reads like a
  // textbook (e.g. OSI 7 → 1).
  const layers = [...figure.layers].reverse();
  return (
    <figure className="surface-card overflow-hidden p-5 sm:p-6">
      <div className="space-y-1.5">
        {layers.map((layer, idx) => {
          const accent = ACCENT[layer.accent];
          return (
            <div
              key={idx}
              className={`relative grid grid-cols-[140px_1fr] items-stretch overflow-hidden rounded-xl ${accent.soft}`}
            >
              <div
                className={`flex items-center gap-2 border-r border-border/60 px-3 py-3 text-[12.5px] font-semibold ${accent.text}`}
              >
                <span
                  aria-hidden
                  className={`h-2 w-2 shrink-0 rounded-full ${accent.bg}`}
                />
                {layer.label}
              </div>
              <div className="flex flex-wrap items-center gap-1.5 px-3 py-3">
                {layer.items.length === 0 ? (
                  <span className="text-[12px] text-muted-foreground">—</span>
                ) : (
                  layer.items.map((it) => (
                    <span
                      key={it}
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[12px] font-medium ${accent.chip}`}
                    >
                      {it}
                    </span>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
      {figure.caption && (
        <figcaption className="mt-4 text-[11.5px] leading-relaxed text-muted-foreground">
          {figure.caption}
        </figcaption>
      )}
    </figure>
  );
}

function CompareFigure({
  figure,
}: {
  figure: Extract<StudyFigure, { kind: "compare" }>;
}) {
  const sides = [figure.left, figure.right] as const;
  return (
    <figure className="surface-card overflow-hidden p-5 sm:p-6">
      <div className="grid gap-3 sm:grid-cols-2">
        {sides.map((side, idx) => {
          const accent = ACCENT[side.accent];
          return (
            <div
              key={idx}
              className={`relative overflow-hidden rounded-xl p-4 ${accent.soft} ring-1 ring-inset ${accent.ring}`}
            >
              <div
                className={`flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] ${accent.text}`}
              >
                <span
                  aria-hidden
                  className={`h-2 w-2 shrink-0 rounded-full ${accent.bg}`}
                />
                {idx === 0 ? "LEFT" : "RIGHT"}
              </div>
              <div className="mt-1 text-[16px] font-semibold tracking-tight">
                {side.title}
              </div>
              <ul className="mt-3 space-y-1.5">
                {side.points.map((p, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-[13px] leading-relaxed"
                  >
                    <span
                      aria-hidden
                      className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${accent.bg}`}
                    />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      {figure.caption && (
        <figcaption className="mt-4 text-[11.5px] leading-relaxed text-muted-foreground">
          {figure.caption}
        </figcaption>
      )}
    </figure>
  );
}

function FlowFigure({
  figure,
}: {
  figure: Extract<StudyFigure, { kind: "flow" }>;
}) {
  return (
    <figure className="surface-card overflow-hidden p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        {figure.steps.map((s, idx) => (
          <div key={idx} className="flex flex-1 items-center gap-3">
            <div className="flex-1 rounded-xl bg-muted/70 p-3 ring-1 ring-inset ring-border">
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                STEP {idx + 1}
              </div>
              <div className="mt-0.5 text-[14px] font-semibold tracking-tight">
                {s.label}
              </div>
              {s.body && (
                <div className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                  {s.body}
                </div>
              )}
            </div>
            {idx < figure.steps.length - 1 && (
              <ArrowRight
                aria-hidden
                className="h-4 w-4 shrink-0 rotate-90 text-muted-foreground sm:rotate-0"
              />
            )}
          </div>
        ))}
      </div>
      {figure.caption && (
        <figcaption className="mt-4 text-[11.5px] leading-relaxed text-muted-foreground">
          {figure.caption}
        </figcaption>
      )}
    </figure>
  );
}

function QuadrantFigure({
  figure,
}: {
  figure: Extract<StudyFigure, { kind: "quadrant" }>;
}) {
  return (
    <figure className="surface-card overflow-hidden p-5 sm:p-6">
      <div className="grid grid-cols-[auto_1fr] gap-3">
        <div
          aria-hidden
          className="flex items-center justify-center text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground [writing-mode:vertical-rl] [transform:rotate(180deg)]"
        >
          {figure.axes.y} →
        </div>
        <div className="grid grid-cols-2 gap-2">
          {figure.cells.map((c, i) => (
            <div
              key={i}
              className="rounded-xl bg-muted/60 p-3 ring-1 ring-inset ring-border"
            >
              <div className="text-[14px] font-semibold tracking-tight">
                {c.title}
              </div>
              {c.body && (
                <div className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
                  {c.body}
                </div>
              )}
            </div>
          ))}
        </div>
        <div aria-hidden />
        <div
          aria-hidden
          className="text-right text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
        >
          {figure.axes.x} →
        </div>
      </div>
      {figure.caption && (
        <figcaption className="mt-4 text-[11.5px] leading-relaxed text-muted-foreground">
          {figure.caption}
        </figcaption>
      )}
    </figure>
  );
}

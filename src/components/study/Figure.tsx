import { ArrowDown, ArrowRight, Check, X } from "lucide-react";
import type { StudyFigure } from "@/lib/contentSchema";

// ── Accent palette ────────────────────────────────────────────────────────
//
// Seven semantic accents. Each maps to a hex hue plus pre-baked Tailwind
// classes for solid fill, soft tint background, ring outline, text and a
// chip-style combined class. The hex form (`hex`, `hexSoft`) is what the
// SVG renderers reach for — Tailwind classes are JIT-friendly so we keep
// them here rather than building them at runtime.

type AccentKey =
  | "primary"
  | "warm"
  | "cool"
  | "neutral"
  | "accent"
  | "danger"
  | "success";

const ACCENT: Record<
  AccentKey,
  {
    hex: string;
    hexSoft: string;
    bg: string;
    ring: string;
    text: string;
    soft: string;
    chip: string;
  }
> = {
  primary: {
    hex: "#0A84FF",
    hexSoft: "rgba(10,132,255,0.08)",
    bg: "bg-[#0A84FF]",
    ring: "ring-[#0A84FF]/30",
    text: "text-[#0A84FF]",
    soft: "bg-[#0A84FF]/[0.07]",
    chip: "bg-[#0A84FF]/10 text-[#0A84FF] ring-1 ring-inset ring-[#0A84FF]/25",
  },
  warm: {
    hex: "#FF9500",
    hexSoft: "rgba(255,149,0,0.08)",
    bg: "bg-[#FF9500]",
    ring: "ring-[#FF9500]/30",
    text: "text-[#FF9500]",
    soft: "bg-[#FF9500]/[0.07]",
    chip: "bg-[#FF9500]/10 text-[#FF9500] ring-1 ring-inset ring-[#FF9500]/25",
  },
  cool: {
    hex: "#00C7BE",
    hexSoft: "rgba(0,199,190,0.08)",
    bg: "bg-[#00C7BE]",
    ring: "ring-[#00C7BE]/30",
    text: "text-[#00C7BE]",
    soft: "bg-[#00C7BE]/[0.07]",
    chip: "bg-[#00C7BE]/10 text-[#00C7BE] ring-1 ring-inset ring-[#00C7BE]/25",
  },
  neutral: {
    hex: "#8E8E93",
    hexSoft: "rgba(142,142,147,0.10)",
    bg: "bg-muted-foreground",
    ring: "ring-border",
    text: "text-muted-foreground",
    soft: "bg-muted",
    chip: "bg-muted text-muted-foreground ring-1 ring-inset ring-border",
  },
  accent: {
    hex: "#AF52DE",
    hexSoft: "rgba(175,82,222,0.08)",
    bg: "bg-[#AF52DE]",
    ring: "ring-[#AF52DE]/30",
    text: "text-[#AF52DE]",
    soft: "bg-[#AF52DE]/[0.07]",
    chip: "bg-[#AF52DE]/10 text-[#AF52DE] ring-1 ring-inset ring-[#AF52DE]/25",
  },
  danger: {
    hex: "#FF3B30",
    hexSoft: "rgba(255,59,48,0.08)",
    bg: "bg-[#FF3B30]",
    ring: "ring-[#FF3B30]/30",
    text: "text-[#FF3B30]",
    soft: "bg-[#FF3B30]/[0.07]",
    chip: "bg-[#FF3B30]/10 text-[#FF3B30] ring-1 ring-inset ring-[#FF3B30]/25",
  },
  success: {
    hex: "#34C759",
    hexSoft: "rgba(52,199,89,0.08)",
    bg: "bg-[#34C759]",
    ring: "ring-[#34C759]/30",
    text: "text-[#34C759]",
    soft: "bg-[#34C759]/[0.07]",
    chip: "bg-[#34C759]/10 text-[#34C759] ring-1 ring-inset ring-[#34C759]/25",
  },
};

const HEX = (k: string): string => ACCENT[(k as AccentKey) ?? "neutral"]?.hex ?? "#8E8E93";

/**
 * Renders a typed lesson figure. Eleven kinds total.
 */
export function StudyFigureView({ figure }: { figure: StudyFigure }) {
  if (figure.kind === "layered") return <LayeredFigure figure={figure} />;
  if (figure.kind === "compare") return <CompareFigure figure={figure} />;
  if (figure.kind === "flow") return <FlowFigure figure={figure} />;
  if (figure.kind === "quadrant") return <QuadrantFigure figure={figure} />;
  if (figure.kind === "step-list") return <StepListFigure figure={figure} />;
  if (figure.kind === "tree") return <TreeFigure figure={figure} />;
  if (figure.kind === "labeled-diagram") return <LabeledDiagramFigure figure={figure} />;
  if (figure.kind === "topology") return <TopologyFigure figure={figure} />;
  if (figure.kind === "matrix") return <MatrixFigure figure={figure} />;
  if (figure.kind === "timeline") return <TimelineFigure figure={figure} />;
  return <ProportionBarFigure figure={figure} />;
}

// ── Frame ────────────────────────────────────────────────────────────────

function FigureFrame({
  caption,
  children,
}: {
  caption?: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="rounded-2xl border border-border bg-card p-5 shadow-surface sm:p-6">
      {children}
      {caption && (
        <figcaption className="mt-4 border-t border-border/60 pt-3 text-[12px] leading-relaxed text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// ── Layered ──────────────────────────────────────────────────────────────

function LayeredFigure({
  figure,
}: {
  figure: Extract<StudyFigure, { kind: "layered" }>;
}) {
  const layers = [...figure.layers].reverse();
  const total = layers.length;
  return (
    <FigureFrame caption={figure.caption}>
      <div className="space-y-1.5">
        {layers.map((layer, idx) => {
          const accent = ACCENT[(layer.accent as AccentKey) ?? "neutral"];
          const layerNum = total - idx;
          return (
            <div
              key={idx}
              className={`relative grid grid-cols-[44px_140px_1fr] items-stretch overflow-hidden rounded-xl ${accent.soft} ring-1 ring-inset ${accent.ring}`}
            >
              <div
                className={`flex items-center justify-center text-[14px] font-semibold ${accent.text}`}
                style={{ background: accent.hex, color: "#fff" }}
              >
                <span className="num">{layerNum}</span>
              </div>
              <div
                className={`flex items-center gap-2 border-r border-border/60 px-3 py-3 text-[12.5px] font-semibold ${accent.text}`}
              >
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
      <div className="mt-3 flex items-center justify-between gap-2 text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <ArrowDown className="h-3 w-3" />
          物理に近い
        </span>
        <span className="inline-flex items-center gap-1.5">
          人間に近い
          <ArrowDown className="h-3 w-3 rotate-180" />
        </span>
      </div>
    </FigureFrame>
  );
}

// ── Compare ──────────────────────────────────────────────────────────────

function CompareFigure({
  figure,
}: {
  figure: Extract<StudyFigure, { kind: "compare" }>;
}) {
  const sides = [
    { ...figure.left, side: "left" as const },
    { ...figure.right, side: "right" as const },
  ];
  return (
    <FigureFrame caption={figure.caption}>
      <div className="relative grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
        {sides.map((side, idx) => {
          const accent = ACCENT[(side.accent as AccentKey) ?? "neutral"];
          return (
            <div
              key={idx}
              className={`relative overflow-hidden rounded-xl p-5 ${accent.soft} ring-1 ring-inset ${accent.ring}`}
            >
              <div
                aria-hidden
                className={`absolute inset-y-3 ${
                  side.side === "left" ? "left-0" : "right-0"
                } w-1 rounded-full`}
                style={{ background: accent.hex }}
              />
              <div
                className={`flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] ${accent.text}`}
              >
                <span
                  aria-hidden
                  className={`h-2 w-2 shrink-0 rounded-full ${accent.bg}`}
                />
                {side.side === "left" ? "Side A" : "Side B"}
              </div>
              <div className="mt-1 text-[17px] font-semibold tracking-tight">
                {side.title}
              </div>
              <ul className="mt-3 space-y-2">
                {side.points.map((p, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-[13px] leading-[1.7]"
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
        {/* "vs" pivot for desktop */}
        <div
          aria-hidden
          className="hidden flex-col items-center justify-center sm:flex"
        >
          <span className="rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground shadow-ios-sm">
            vs
          </span>
        </div>
      </div>
    </FigureFrame>
  );
}

// ── Flow ─────────────────────────────────────────────────────────────────

function FlowFigure({
  figure,
}: {
  figure: Extract<StudyFigure, { kind: "flow" }>;
}) {
  return (
    <FigureFrame caption={figure.caption}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        {figure.steps.map((s, idx) => (
          <div key={idx} className="flex flex-1 items-center gap-3">
            <div className="flex-1 rounded-xl bg-muted/60 p-4 ring-1 ring-inset ring-border">
              <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                <span className="num flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[11px] text-background">
                  {idx + 1}
                </span>
                Step
              </div>
              <div className="mt-1.5 text-[14px] font-semibold tracking-tight">
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
    </FigureFrame>
  );
}

// ── Quadrant ─────────────────────────────────────────────────────────────

function QuadrantFigure({
  figure,
}: {
  figure: Extract<StudyFigure, { kind: "quadrant" }>;
}) {
  const ACCENTS: AccentKey[] = ["success", "primary", "warm", "danger"];
  return (
    <FigureFrame caption={figure.caption}>
      <div className="grid grid-cols-[auto_1fr_auto] gap-2">
        {/* Y axis label */}
        <div
          aria-hidden
          className="flex items-center justify-center text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground [writing-mode:vertical-rl] [transform:rotate(180deg)]"
        >
          ↑ {figure.axes.y}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {figure.cells.map((c, i) => {
            const accent = ACCENT[ACCENTS[i] ?? "neutral"];
            return (
              <div
                key={i}
                className={`rounded-xl ${accent.soft} p-4 ring-1 ring-inset ${accent.ring}`}
              >
                <div
                  className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${accent.text}`}
                >
                  <span
                    aria-hidden
                    className={`h-1.5 w-1.5 rounded-full ${accent.bg}`}
                  />
                  Q{i + 1}
                </div>
                <div className="mt-1 text-[14.5px] font-semibold tracking-tight">
                  {c.title}
                </div>
                {c.body && (
                  <div className="mt-1 text-[12px] leading-relaxed text-muted-foreground text-pretty">
                    {c.body}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div aria-hidden className="hidden sm:block" />
        <div aria-hidden />
        <div className="text-right text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {figure.axes.x} →
        </div>
        <div aria-hidden className="hidden sm:block" />
      </div>
    </FigureFrame>
  );
}

// ── Step list ────────────────────────────────────────────────────────────

function StepListFigure({
  figure,
}: {
  figure: Extract<StudyFigure, { kind: "step-list" }>;
}) {
  return (
    <FigureFrame caption={figure.caption}>
      <ol className="relative space-y-3">
        {figure.steps.map((s, idx) => (
          <li
            key={idx}
            className="grid grid-cols-[44px_1fr] items-start gap-3"
          >
            <div className="flex flex-col items-center">
              <span className="num flex h-10 w-10 items-center justify-center rounded-full bg-[#0A84FF] text-[15px] font-semibold text-white shadow-tile">
                {idx + 1}
              </span>
              {idx < figure.steps.length - 1 && (
                <span
                  aria-hidden
                  className="mt-1 h-full w-px flex-1 bg-border"
                  style={{ minHeight: 12 }}
                />
              )}
            </div>
            <div className="rounded-xl bg-muted/50 p-4 ring-1 ring-inset ring-border">
              <div className="text-[14.5px] font-semibold tracking-tight">
                {s.title}
              </div>
              <div className="mt-1.5 text-[13px] leading-[1.75] text-foreground/80 text-pretty">
                {s.body}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </FigureFrame>
  );
}

// ── Tree ─────────────────────────────────────────────────────────────────

function TreeFigure({
  figure,
}: {
  figure: Extract<StudyFigure, { kind: "tree" }>;
}) {
  const N = figure.children.length;
  const cols = Math.min(N, 3);
  return (
    <FigureFrame caption={figure.caption}>
      {/* Root */}
      <div className="mx-auto max-w-md rounded-2xl bg-foreground p-4 text-center text-background shadow-tile">
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.18em] opacity-70">
          Root
        </div>
        <div className="mt-1 text-[16px] font-semibold tracking-tight">
          {figure.root.title}
        </div>
        {figure.root.body && (
          <div className="mt-1 text-[12px] leading-relaxed opacity-85">
            {figure.root.body}
          </div>
        )}
      </div>
      {/* SVG connector lines from root to each child column */}
      <div className="relative h-7 w-full">
        <svg
          viewBox="0 0 100 28"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          {figure.children.map((_, i) => {
            const xCenter = 50;
            const xChild = (100 / cols) * (i % cols) + 100 / (cols * 2);
            return (
              <path
                key={i}
                d={`M ${xCenter} 0 C ${xCenter} 16, ${xChild} 12, ${xChild} 28`}
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth="0.6"
              />
            );
          })}
        </svg>
      </div>
      {/* Children */}
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {figure.children.map((c, idx) => {
          const accent = ACCENT[(c.accent as AccentKey) ?? "neutral"];
          return (
            <div
              key={idx}
              className={`rounded-xl ${accent.soft} p-3.5 ring-1 ring-inset ${accent.ring}`}
            >
              <div
                className={`flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.14em] ${accent.text}`}
              >
                <span className="flex items-center gap-1.5">
                  <span
                    aria-hidden
                    className={`h-1.5 w-1.5 rounded-full ${accent.bg}`}
                  />
                  Branch
                </span>
                <span className="num opacity-70">
                  {String(idx + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="mt-1 text-[14.5px] font-semibold tracking-tight">
                {c.title}
              </div>
              {c.body && (
                <div className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground text-pretty">
                  {c.body}
                </div>
              )}
              {c.items.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {c.items.map((it, i) => (
                    <li
                      key={i}
                      className="flex gap-1.5 text-[12px] leading-[1.65] text-foreground/85"
                    >
                      <Check
                        aria-hidden
                        className={`mt-0.5 h-3 w-3 shrink-0 ${accent.text}`}
                      />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </FigureFrame>
  );
}

// ── Labeled diagram ─────────────────────────────────────────────────────

function LabeledDiagramFigure({
  figure,
}: {
  figure: Extract<StudyFigure, { kind: "labeled-diagram" }>;
}) {
  const accent = ACCENT[(figure.centerpiece.accent as AccentKey) ?? "neutral"];
  return (
    <FigureFrame caption={figure.caption}>
      <div className="grid gap-5 sm:grid-cols-[260px_1fr] sm:items-center">
        <div
          className={`relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-2xl ${accent.soft} p-6 text-center ring-1 ring-inset ${accent.ring}`}
        >
          <span
            className={`flex h-3 w-3 rounded-full ${accent.bg}`}
            aria-hidden
          />
          <div className="mt-4 text-[20px] font-semibold tracking-tight">
            {figure.centerpiece.title}
          </div>
          {figure.centerpiece.body && (
            <div className="mt-2 max-w-[220px] text-[12.5px] leading-[1.7] text-muted-foreground text-pretty">
              {figure.centerpiece.body}
            </div>
          )}
          {/* SVG connector arms emanating from the center to right edge */}
          <svg
            aria-hidden
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 h-full w-full opacity-40"
          >
            <circle cx="50" cy="50" r="2" fill={accent.hex} />
            <circle cx="50" cy="50" r="14" fill="none" stroke={accent.hex} strokeWidth="0.6" strokeDasharray="2 2" />
          </svg>
        </div>
        <ul className="space-y-2">
          {figure.labels.map((lbl, i) => (
            <li
              key={i}
              className="grid grid-cols-[28px_auto_1fr] items-baseline gap-2"
            >
              <span
                className="num flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-semibold"
                style={{ background: `${accent.hex}1A`, color: accent.hex }}
              >
                {i + 1}
              </span>
              <span className="text-[14px] font-semibold tracking-tight">
                {lbl.label}
              </span>
              <span className="text-[13px] leading-[1.7] text-muted-foreground text-pretty">
                {lbl.body}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </FigureFrame>
  );
}

// ── Topology ─────────────────────────────────────────────────────────────

function TopologyFigure({
  figure,
}: {
  figure: Extract<StudyFigure, { kind: "topology" }>;
}) {
  const W = 800;
  const H = 460;
  const NODE_W = 150;
  const NODE_H = 64;
  const nodeMap = new Map(figure.nodes.map((n) => [n.id, n]));

  return (
    <FigureFrame caption={figure.caption}>
      <div className="relative w-full overflow-hidden rounded-xl bg-gradient-to-br from-muted/40 to-muted/10 p-2 ring-1 ring-inset ring-border">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
            </marker>
          </defs>

          {/* Edges (drawn first so they appear under nodes) */}
          {figure.edges.map((e, i) => {
            const a = nodeMap.get(e.from);
            const b = nodeMap.get(e.to);
            if (!a || !b) return null;
            const ax = (a.x / 100) * W;
            const ay = (a.y / 100) * H;
            const bx = (b.x / 100) * W;
            const by = (b.y / 100) * H;
            const mx = (ax + bx) / 2;
            const my = (ay + by) / 2;
            const dash = e.style === "dashed" ? "6 6" : undefined;
            const markerEnd =
              e.style === "arrow" || e.style === "bidir"
                ? "url(#arrow)"
                : undefined;
            const markerStart =
              e.style === "bidir" ? "url(#arrow)" : undefined;
            return (
              <g key={i}>
                <line
                  x1={ax}
                  y1={ay}
                  x2={bx}
                  y2={by}
                  stroke="#64748b"
                  strokeWidth={2}
                  strokeDasharray={dash}
                  markerEnd={markerEnd}
                  markerStart={markerStart}
                  opacity={0.7}
                />
                {e.label && (
                  <g transform={`translate(${mx}, ${my})`}>
                    <rect
                      x={-44}
                      y={-12}
                      width={88}
                      height={22}
                      rx={6}
                      fill="white"
                      stroke="#e2e8f0"
                    />
                    <text
                      textAnchor="middle"
                      y={3}
                      fontSize={11}
                      fontFamily="ui-sans-serif, system-ui, sans-serif"
                      fill="#475569"
                    >
                      {e.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {figure.nodes.map((n) => {
            const cx = (n.x / 100) * W;
            const cy = (n.y / 100) * H;
            const accent = ACCENT[(n.accent as AccentKey) ?? "neutral"];
            return (
              <g key={n.id} transform={`translate(${cx}, ${cy})`}>
                {/* Shadow */}
                <ellipse
                  cx={0}
                  cy={NODE_H / 2 + 6}
                  rx={NODE_W / 2 - 8}
                  ry={3}
                  fill="rgba(15,23,42,0.10)"
                />
                {n.shape === "circle" ? (
                  <circle
                    cx={0}
                    cy={0}
                    r={NODE_H / 2}
                    fill="white"
                    stroke={accent.hex}
                    strokeWidth={2}
                  />
                ) : n.shape === "cloud" ? (
                  <path
                    d={cloudPath(NODE_W, NODE_H)}
                    transform={`translate(${-NODE_W / 2}, ${-NODE_H / 2})`}
                    fill="white"
                    stroke={accent.hex}
                    strokeWidth={2}
                  />
                ) : (
                  <rect
                    x={-NODE_W / 2}
                    y={-NODE_H / 2}
                    width={NODE_W}
                    height={NODE_H}
                    rx={12}
                    fill="white"
                    stroke={accent.hex}
                    strokeWidth={2}
                  />
                )}
                {/* Accent stripe */}
                <rect
                  x={-NODE_W / 2}
                  y={-NODE_H / 2}
                  width={6}
                  height={NODE_H}
                  rx={3}
                  fill={accent.hex}
                />
                <text
                  x={-NODE_W / 2 + 16}
                  y={n.sublabel ? -2 : 6}
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                  fontWeight={600}
                  fontSize={14}
                  fill="#0f172a"
                >
                  {n.label}
                </text>
                {n.sublabel && (
                  <text
                    x={-NODE_W / 2 + 16}
                    y={16}
                    fontFamily="ui-sans-serif, system-ui, sans-serif"
                    fontSize={11}
                    fill="#64748b"
                  >
                    {n.sublabel}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </FigureFrame>
  );
}

function cloudPath(w: number, h: number): string {
  // A simplified cloud silhouette inscribed in a w×h box.
  return [
    `M ${w * 0.2} ${h * 0.7}`,
    `Q 0 ${h * 0.7} ${w * 0.05} ${h * 0.45}`,
    `Q 0 ${h * 0.2} ${w * 0.25} ${h * 0.2}`,
    `Q ${w * 0.35} ${h * 0.0} ${w * 0.55} ${h * 0.15}`,
    `Q ${w * 0.78} ${h * 0.0} ${w * 0.85} ${h * 0.3}`,
    `Q ${w} ${h * 0.4} ${w * 0.92} ${h * 0.65}`,
    `Q ${w} ${h * 0.95} ${w * 0.7} ${h * 0.85}`,
    `L ${w * 0.3} ${h * 0.85}`,
    `Q ${w * 0.05} ${h * 0.95} ${w * 0.2} ${h * 0.7} z`,
  ].join(" ");
}

// ── Matrix ──────────────────────────────────────────────────────────────

function MatrixFigure({
  figure,
}: {
  figure: Extract<StudyFigure, { kind: "matrix" }>;
}) {
  return (
    <FigureFrame caption={figure.caption}>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left">
          <thead>
            <tr>
              <th className="border-b border-border px-3 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground" />
              {figure.columns.map((c, i) => {
                const accent = ACCENT[(c.accent as AccentKey) ?? "neutral"];
                return (
                  <th
                    key={i}
                    className={`border-b border-border px-3 py-2.5 text-[12.5px] font-semibold tracking-tight ${accent.text}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        aria-hidden
                        className={`inline-block h-1.5 w-1.5 rounded-full ${accent.bg}`}
                      />
                      {c.title}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {figure.rows.map((row, ri) => (
              <tr key={ri} className="align-top">
                <th
                  scope="row"
                  className="whitespace-nowrap border-b border-border/60 px-3 py-3 text-[12px] font-semibold text-muted-foreground"
                >
                  {row.label}
                </th>
                {row.cells.map((cell, ci) => {
                  const tone =
                    cell.tone === "positive"
                      ? "text-[#34C759]"
                      : cell.tone === "negative"
                        ? "text-[#FF3B30]"
                        : "text-foreground/85";
                  const Icon =
                    cell.tone === "positive"
                      ? Check
                      : cell.tone === "negative"
                        ? X
                        : null;
                  return (
                    <td
                      key={ci}
                      className="border-b border-border/60 px-3 py-3 text-[12.5px] leading-[1.7]"
                    >
                      <div className={`flex items-start gap-1.5 ${tone}`}>
                        {Icon && (
                          <Icon
                            aria-hidden
                            className="mt-0.5 h-3.5 w-3.5 shrink-0"
                          />
                        )}
                        <span className="text-foreground/90">{cell.text}</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FigureFrame>
  );
}

// ── Timeline ────────────────────────────────────────────────────────────

function TimelineFigure({
  figure,
}: {
  figure: Extract<StudyFigure, { kind: "timeline" }>;
}) {
  const total = figure.phases.reduce((s, p) => s + p.weight, 0);
  return (
    <FigureFrame caption={figure.caption}>
      {/* Bars */}
      <div className="flex h-10 w-full overflow-hidden rounded-lg ring-1 ring-inset ring-border">
        {figure.phases.map((p, i) => {
          const accent = ACCENT[(p.accent as AccentKey) ?? "neutral"];
          const pct = (p.weight / total) * 100;
          return (
            <div
              key={i}
              className="flex items-center justify-center text-[11px] font-semibold text-white"
              style={{ background: accent.hex, width: `${pct}%` }}
            >
              <span className="num">{i + 1}</span>
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <ul className="mt-4 space-y-2.5">
        {figure.phases.map((p, i) => {
          const accent = ACCENT[(p.accent as AccentKey) ?? "neutral"];
          return (
            <li key={i} className="grid grid-cols-[28px_1fr] gap-3">
              <span
                className="num flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                style={{ background: accent.hex }}
              >
                {i + 1}
              </span>
              <div>
                <div className="text-[14px] font-semibold tracking-tight">
                  {p.label}
                </div>
                {p.body && (
                  <div className="mt-0.5 text-[12.5px] leading-[1.7] text-muted-foreground text-pretty">
                    {p.body}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </FigureFrame>
  );
}

// ── Proportion bar ──────────────────────────────────────────────────────

function ProportionBarFigure({
  figure,
}: {
  figure: Extract<StudyFigure, { kind: "proportion-bar" }>;
}) {
  const sum = figure.segments.reduce((s, x) => s + x.value, 0);
  const denom = Math.max(figure.total, sum);
  return (
    <FigureFrame caption={figure.caption}>
      <div className="flex h-12 w-full overflow-hidden rounded-lg ring-1 ring-inset ring-border">
        {figure.segments.map((seg, i) => {
          const accent = ACCENT[(seg.accent as AccentKey) ?? "neutral"];
          const pct = (seg.value / denom) * 100;
          return (
            <div
              key={i}
              className="flex items-center justify-center text-[12px] font-semibold text-white"
              style={{ background: accent.hex, width: `${pct}%` }}
              title={`${seg.label} : ${seg.value}`}
            >
              <span className="num">{Math.round(pct)}%</span>
            </div>
          );
        })}
      </div>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {figure.segments.map((seg, i) => {
          const accent = ACCENT[(seg.accent as AccentKey) ?? "neutral"];
          return (
            <li key={i} className="flex items-center gap-2 text-[13px]">
              <span
                aria-hidden
                className={`h-2.5 w-2.5 rounded-sm ${accent.bg}`}
              />
              <span className="font-semibold">{seg.label}</span>
              <span className="num ml-auto text-muted-foreground">
                {seg.value}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="mt-2 text-[11px] text-muted-foreground">
        Sum: <span className="num font-semibold text-foreground">{sum}</span>{" "}
        {denom > sum && (
          <>
            / Total{" "}
            <span className="num font-semibold text-foreground">{denom}</span>
          </>
        )}
      </div>
    </FigureFrame>
  );
}

// ── HEX export for outside use (used by Thumbnail.tsx) ───────────────────

export const ACCENT_HEX = HEX;

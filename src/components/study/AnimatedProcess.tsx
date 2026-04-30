"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import type { StudyFigure } from "@/lib/contentSchema";

type Animated = Extract<StudyFigure, { kind: "animated-process" }>;

const HUE: Record<string, string> = {
  primary: "#0A84FF",
  warm: "#FF9500",
  cool: "#00C7BE",
  neutral: "#8E8E93",
  accent: "#AF52DE",
  danger: "#FF3B30",
  success: "#34C759",
};

/**
 * Renders an animated protocol diagram as an SVG-based "video-ish" figure.
 *
 * Why not a real video?
 *   • The number of distinct animations needed is large (one per topic),
 *     and each has to be authored, encoded, hosted, captioned, and kept
 *     in sync with the JSON content. SVG steps are authored in JSON and
 *     animated by the same client component.
 *   • Self-contained means no external network, no cookies, no privacy
 *     surface, no broken links, no buffering.
 *
 * Authoring contract (validated by Zod):
 *   actors: 2-6 fixed-position boxes/circles/devices.
 *   steps : ordered list of (from → to) packet hops with narration.
 *
 * Behavior:
 *   • Auto-plays on mount, respects prefers-reduced-motion.
 *   • Play / Pause / Step / Restart controls below the canvas.
 *   • The current step's narration is rendered as a caption beneath the
 *     diagram (so the figure reads even if motion is reduced).
 */
export function AnimatedProcess({ figure }: { figure: Animated }) {
  const W = 800;
  const H = 380;
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const tickRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!playing || reducedMotion) return;
    if (tickRef.current) clearTimeout(tickRef.current);
    tickRef.current = setTimeout(() => {
      setStepIdx((i) => (i + 1) % figure.steps.length);
    }, figure.stepDurationMs);
    return () => {
      if (tickRef.current) clearTimeout(tickRef.current);
    };
  }, [playing, reducedMotion, stepIdx, figure.steps.length, figure.stepDurationMs]);

  const actorMap = useMemo(
    () => new Map(figure.actors.map((a) => [a.id, a])),
    [figure.actors]
  );
  const step = figure.steps[stepIdx];
  const from = actorMap.get(step.from);
  const to = actorMap.get(step.to);

  return (
    <figure className="rounded-2xl border border-border bg-card p-5 shadow-surface sm:p-6">
      {/* Title bar */}
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0A84FF]/10 px-2.5 py-1 text-[11px] font-semibold text-[#0A84FF]">
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#0A84FF]"
          />
          動く図解
        </span>
        <div className="text-[12px] text-muted-foreground">
          ステップ <span className="num font-semibold text-foreground">{stepIdx + 1}</span>
          {" / "}
          <span className="num">{figure.steps.length}</span>
        </div>
      </div>

      {/* SVG canvas */}
      <div className="relative w-full overflow-hidden rounded-xl bg-gradient-to-br from-muted/40 to-muted/10 ring-1 ring-inset ring-border">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <marker
              id="ap-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
            </marker>
          </defs>

          {/* Actors */}
          {figure.actors.map((a) => {
            const cx = (a.x / 100) * W;
            const cy = (a.y / 100) * H;
            const isActive = a.id === step.from || a.id === step.to;
            const accent = HUE[a.accent] ?? HUE.neutral;
            return (
              <g
                key={a.id}
                transform={`translate(${cx}, ${cy})`}
                style={{ transition: "filter 300ms ease-out" }}
                filter={isActive ? "url(#none)" : undefined}
              >
                {/* Pulse ring on the source actor */}
                {a.id === step.from && !reducedMotion && (
                  <circle
                    r={56}
                    fill="none"
                    stroke={accent}
                    strokeWidth={2}
                    opacity={0.6}
                  >
                    <animate
                      attributeName="r"
                      values="48;72;48"
                      dur="1.6s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.55;0;0.55"
                      dur="1.6s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                <ellipse
                  cx={0}
                  cy={36}
                  rx={68}
                  ry={4}
                  fill="rgba(15,23,42,0.10)"
                />
                {a.shape === "circle" ? (
                  <circle
                    r={36}
                    fill="white"
                    stroke={accent}
                    strokeWidth={2.5}
                  />
                ) : (
                  <rect
                    x={-72}
                    y={-32}
                    width={144}
                    height={64}
                    rx={14}
                    fill="white"
                    stroke={accent}
                    strokeWidth={2.5}
                  />
                )}
                <rect
                  x={-72}
                  y={-32}
                  width={6}
                  height={64}
                  rx={3}
                  fill={accent}
                />
                <text
                  x={-58}
                  y={a.sublabel ? -2 : 6}
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                  fontWeight={700}
                  fontSize={15}
                  fill="#0f172a"
                >
                  {a.label}
                </text>
                {a.sublabel && (
                  <text
                    x={-58}
                    y={16}
                    fontFamily="ui-sans-serif, system-ui, sans-serif"
                    fontSize={11}
                    fill="#64748b"
                  >
                    {a.sublabel}
                  </text>
                )}
              </g>
            );
          })}

          {/* Active edge + animated packet */}
          {from && to && (
            <ActiveEdge
              key={stepIdx}
              fromX={(from.x / 100) * W}
              fromY={(from.y / 100) * H}
              toX={(to.x / 100) * W}
              toY={(to.y / 100) * H}
              payload={step.payload}
              accent={HUE[step.packetAccent] ?? HUE.primary}
              durationMs={figure.stepDurationMs}
              reducedMotion={reducedMotion}
            />
          )}
        </svg>

        {/* Narration overlay */}
        <div className="absolute inset-x-3 bottom-3 rounded-xl bg-foreground/[0.92] px-4 py-2.5 text-background backdrop-blur">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.18em] opacity-70">
            {step.title}
          </div>
          <div className="mt-0.5 text-[12.5px] leading-relaxed">
            {step.narration}
          </div>
        </div>
      </div>

      {/* Controls + step pips */}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-1 rounded-full bg-muted p-1">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background transition-transform hover:brightness-110 active:scale-95"
            aria-label={playing ? "一時停止" : "再生"}
          >
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setStepIdx((i) => (i + 1) % figure.steps.length);
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-card hover:text-foreground"
            aria-label="次のステップ"
          >
            <SkipForward className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setStepIdx(0);
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-card hover:text-foreground"
            aria-label="最初に戻す"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
        {/* Step pips */}
        <div className="flex flex-1 items-center gap-1.5">
          {figure.steps.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setPlaying(false);
                setStepIdx(i);
              }}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i === stepIdx
                  ? "bg-[#0A84FF]"
                  : i < stepIdx
                    ? "bg-foreground/40"
                    : "bg-muted-foreground/20"
              }`}
              aria-label={`ステップ ${i + 1} に移動`}
            />
          ))}
        </div>
      </div>

      {figure.caption && (
        <figcaption className="mt-4 border-t border-border/60 pt-3 text-[12px] leading-relaxed text-muted-foreground">
          {figure.caption}
        </figcaption>
      )}
    </figure>
  );
}

function ActiveEdge({
  fromX,
  fromY,
  toX,
  toY,
  payload,
  accent,
  durationMs,
  reducedMotion,
}: {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  payload?: string;
  accent: string;
  durationMs: number;
  reducedMotion: boolean;
}) {
  const midX = (fromX + toX) / 2;
  const midY = (fromY + toY) / 2 - 30;
  const path = `M ${fromX} ${fromY} Q ${midX} ${midY} ${toX} ${toY}`;
  const animDur = `${(durationMs * 0.85) / 1000}s`;
  return (
    <g>
      {/* Trace line */}
      <path
        d={path}
        fill="none"
        stroke={accent}
        strokeWidth={2.5}
        opacity={0.4}
        strokeDasharray="6 6"
        markerEnd="url(#ap-arrow)"
      />
      {/* The "packet" — a labeled chip that travels along the path */}
      {!reducedMotion ? (
        <g>
          <circle
            r={9}
            fill={accent}
            opacity={0.9}
          >
            <animateMotion
              dur={animDur}
              repeatCount="1"
              fill="freeze"
              path={path}
            />
          </circle>
          {payload && (
            <g>
              <rect
                x={-58}
                y={-32}
                width={116}
                height={26}
                rx={8}
                fill={accent}
              >
                <animateMotion
                  dur={animDur}
                  repeatCount="1"
                  fill="freeze"
                  path={path}
                />
              </rect>
              <text
                textAnchor="middle"
                y={-15}
                fontFamily="ui-sans-serif, system-ui, sans-serif"
                fontWeight={700}
                fontSize={12}
                fill="white"
              >
                {payload}
                <animateMotion
                  dur={animDur}
                  repeatCount="1"
                  fill="freeze"
                  path={path}
                />
              </text>
            </g>
          )}
        </g>
      ) : (
        // Static fallback — show the packet at the midpoint
        <g transform={`translate(${midX}, ${midY + 30})`}>
          <circle r={9} fill={accent} />
          {payload && (
            <g>
              <rect
                x={-58}
                y={-44}
                width={116}
                height={26}
                rx={8}
                fill={accent}
              />
              <text
                textAnchor="middle"
                y={-27}
                fontFamily="ui-sans-serif, system-ui, sans-serif"
                fontWeight={700}
                fontSize={12}
                fill="white"
              >
                {payload}
              </text>
            </g>
          )}
        </g>
      )}
    </g>
  );
}

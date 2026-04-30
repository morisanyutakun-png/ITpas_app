"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, RotateCcw, SkipForward, Mail } from "lucide-react";
import { Key, Lock, Server, Skull, Smartphone, Hash, Shield, FileText } from "lucide-react";
import type { StudyFigure } from "@/lib/contentSchema";
import { Character } from "./Characters";

type Cinematic = Extract<StudyFigure, { kind: "cinematic" }>;
type Obj = Cinematic["objects"][number];
type Scene = Cinematic["scenes"][number];
type Action = Scene["actions"][number];
type Accent = Obj["accent"];

const HUE: Record<Accent, string> = {
  primary: "#0A84FF",
  warm: "#FF9500",
  cool: "#00C7BE",
  neutral: "#8E8E93",
  accent: "#AF52DE",
  danger: "#FF3B30",
  success: "#34C759",
};

const ASPECT: Record<Cinematic["aspect"], string> = {
  "16:9": "56.25%",
  "4:3": "75%",
  "21:9": "42.86%",
};

/**
 * Cinematic — a timeline-driven scene player.
 *
 * Each scene has its own duration; within a scene multiple actions run
 * concurrently. The player tracks "current time within the current scene"
 * with a 30 fps tick, then resolves every object's state by applying all
 * actions whose `at + duration` window has elapsed (with linear easing
 * during the duration). A wrapper `<div>` for each object receives the
 * computed transform, opacity, color and decorative effect class.
 *
 * No SVG `animateMotion` here — DOM transforms compose better when many
 * objects move at once, and CSS makes the decorative shake/pulse/flash
 * effects trivial.
 */
export function CinematicFigure({ figure }: { figure: Cinematic }) {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [reduced, setReduced] = useState(false);
  // Time elapsed within the current scene, in ms.
  const [t, setT] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);

  // Detect prefers-reduced-motion.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const scene = figure.scenes[sceneIdx];

  // Animation loop.
  useEffect(() => {
    if (!playing || reduced) return;
    const step = (now: number) => {
      if (lastRef.current == null) lastRef.current = now;
      const dt = now - lastRef.current;
      lastRef.current = now;
      setT((prev) => {
        const next = prev + dt;
        if (next >= scene.duration) {
          // advance scene
          setSceneIdx((i) => (i + 1) % figure.scenes.length);
          return 0;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastRef.current = null;
    };
  }, [playing, reduced, scene.duration, figure.scenes.length]);

  // Reset elapsed time whenever the scene changes via skip.
  useEffect(() => {
    setT(0);
    lastRef.current = null;
  }, [sceneIdx]);

  const objStates = useMemo(() => {
    const states = new Map<string, ResolvedObj>();
    for (const o of figure.objects) {
      states.set(o.id, {
        x: o.x,
        y: o.y,
        scale: o.scale,
        rotation: o.rotation,
        opacity: o.hidden ? 0 : o.opacity,
        accent: o.accent,
        label: o.label ?? "",
        sublabel: o.sublabel ?? "",
        expression: o.expression ?? "neutral",
        effect: null,
        kind: o.kind,
        character: o.character,
        width: o.width,
        height: o.height,
      });
    }
    // Apply all actions in this scene up to time `t`, blending.
    for (const action of scene.actions) {
      const start = action.at;
      const end = action.at + action.duration;
      if (t < start) continue;
      const cur = states.get(action.target);
      if (!cur) continue;
      const progress = action.duration === 0 ? 1 : Math.min(1, (t - start) / action.duration);
      // Numeric tween from current → action.* using simple ease-in-out.
      const ease = easeInOut(progress);
      if (action.x !== undefined) cur.x = lerp(cur.x, action.x, ease);
      if (action.y !== undefined) cur.y = lerp(cur.y, action.y, ease);
      if (action.scale !== undefined) cur.scale = lerp(cur.scale, action.scale, ease);
      if (action.rotation !== undefined)
        cur.rotation = lerp(cur.rotation, action.rotation, ease);
      if (action.opacity !== undefined)
        cur.opacity = lerp(cur.opacity, action.opacity, ease);
      // Snap (non-tweened) props at the start of the window.
      if (action.accent !== undefined) cur.accent = action.accent;
      if (action.label !== undefined) cur.label = action.label;
      if (action.sublabel !== undefined) cur.sublabel = action.sublabel;
      if (action.expression !== undefined) cur.expression = action.expression;
      if (action.hidden !== undefined) cur.opacity = action.hidden ? 0 : cur.opacity;
      if (action.effect && t < end) cur.effect = action.effect;
    }
    return states;
  }, [figure.objects, scene.actions, t]);

  return (
    <figure className="rounded-2xl border border-border bg-card p-5 shadow-surface sm:p-6">
      {/* Title bar */}
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#AF52DE]/12 px-2.5 py-1 text-[11px] font-semibold text-[#AF52DE]">
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#AF52DE]"
          />
          シーン解説
        </span>
        <div className="text-[12px] text-muted-foreground">
          シーン{" "}
          <span className="num font-semibold text-foreground">{sceneIdx + 1}</span>
          {" / "}
          <span className="num">{figure.scenes.length}</span>
          <span className="ml-2 text-muted-foreground/70">{scene.title}</span>
        </div>
      </div>

      {/* Stage — pure canvas, no overlapping narration */}
      <div
        className="relative w-full overflow-hidden rounded-xl bg-gradient-to-br from-[#0A84FF]/[0.04] via-muted/30 to-[#AF52DE]/[0.05] ring-1 ring-inset ring-border"
        style={{ paddingTop: ASPECT[figure.aspect] }}
      >
        <div className="absolute inset-0">
          {/* Background grid */}
          <svg
            aria-hidden
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full opacity-[0.06]"
          >
            <defs>
              <pattern id="cin-grid" width="5" height="5" patternUnits="userSpaceOnUse">
                <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#0F172A" strokeWidth="0.2" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#cin-grid)" />
          </svg>

          {/* Objects */}
          {figure.objects.map((o) => {
            const s = objStates.get(o.id);
            if (!s) return null;
            return <CinObject key={o.id} obj={o} state={s} />;
          })}
        </div>
      </div>

      {/* Narration block — sits below the canvas so it never overlaps
          the characters or props. Title + narration as a black "subtitle
          card" with a leading dot to suggest a TV-bug. */}
      <div className="mt-3 rounded-xl bg-foreground px-4 py-3 text-background">
        <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.18em] opacity-70">
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 rounded-full bg-[#AF52DE]"
          />
          {scene.title}
        </div>
        <div className="mt-1 text-[13px] leading-[1.75]">
          {scene.narration}
        </div>
      </div>

      {/* Controls */}
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
              setSceneIdx((i) => (i + 1) % figure.scenes.length);
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-card hover:text-foreground"
            aria-label="次のシーン"
          >
            <SkipForward className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setSceneIdx(0);
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-card hover:text-foreground"
            aria-label="最初に戻す"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex flex-1 items-center gap-1.5">
          {figure.scenes.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setPlaying(false);
                setSceneIdx(i);
              }}
              className={`group h-1.5 flex-1 rounded-full transition-colors ${
                i === sceneIdx
                  ? "bg-[#AF52DE]"
                  : i < sceneIdx
                    ? "bg-foreground/40"
                    : "bg-muted-foreground/20"
              }`}
              aria-label={`シーン ${i + 1}: ${s.title}`}
              title={s.title}
            >
              {/* Internal progress sliver for the active scene */}
              {i === sceneIdx && (
                <span
                  aria-hidden
                  className="block h-full origin-left rounded-full bg-foreground/60"
                  style={{
                    width: `${Math.min(100, (t / scene.duration) * 100)}%`,
                  }}
                />
              )}
            </button>
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

// ── Object renderer ─────────────────────────────────────────────────────

type ResolvedObj = {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  accent: Accent;
  label: string;
  sublabel: string;
  expression: NonNullable<Obj["expression"]>;
  effect: Action["effect"] | null;
  kind: Obj["kind"];
  character?: Obj["character"];
  width: number;
  height: number;
};

function CinObject({ obj, state }: { obj: Obj; state: ResolvedObj }) {
  const hue = HUE[state.accent];
  const effectClass =
    state.effect === "pulse"
      ? "cin-effect-pulse"
      : state.effect === "flash"
        ? "cin-effect-flash"
        : state.effect === "shake"
          ? "cin-effect-shake"
          : state.effect === "spin"
            ? "cin-effect-spin"
            : state.effect === "ripple"
              ? "cin-effect-ripple"
              : "";

  // Characters are drawn full-body and shouldn't get a tinted box around
  // them; their wrapper just positions the SVG. Other objects keep the
  // existing renderShape fallback path.
  const isCharacter = state.kind === "character";

  // Character avatars sit on the back layer so keys/locks/envelopes drawn
  // afterwards land *on top of* the character (rather than the other way
  // around, which was hiding the props). Use explicit z-index because the
  // children share the same stacking context.
  return (
    <div
      className={`absolute ${isCharacter ? "z-0" : "z-10"} cin-anim-fast`}
      style={{
        left: `${state.x}%`,
        top: `${state.y}%`,
        transform: `translate(-50%, -50%) scale(${state.scale}) rotate(${state.rotation}deg)`,
        opacity: state.opacity,
        width: `${state.width}%`,
      }}
    >
      <div
        className={`relative ${isCharacter ? "cin-breathe" : ""} ${effectClass}`}
        style={{ "--cin-hue": hue } as React.CSSProperties}
      >
        {isCharacter ? (
          <Character
            name={state.character ?? "alice"}
            expression={state.expression}
            label={state.label || undefined}
            sublabel={state.sublabel || undefined}
          />
        ) : (
          renderShape(obj, state, hue)
        )}
      </div>
    </div>
  );
}

function renderShape(obj: Obj, s: ResolvedObj, hue: string) {
  switch (s.kind) {
    case "box":
      return (
        <div
          className="rounded-xl border-2 bg-white px-3 py-2 shadow-tile"
          style={{ borderColor: hue }}
        >
          <div
            className="absolute left-0 top-2 bottom-2 w-1 rounded-r"
            style={{ background: hue }}
          />
          <div className="text-[12.5px] font-semibold tracking-tight text-foreground">
            {s.label}
          </div>
          {s.sublabel && (
            <div className="text-[10.5px] text-muted-foreground">
              {s.sublabel}
            </div>
          )}
        </div>
      );
    case "circle":
      return (
        <div
          className="flex aspect-square items-center justify-center rounded-full text-white shadow-tile"
          style={{ background: hue, minWidth: "48px" }}
        >
          <span className="text-[12px] font-semibold">{s.label}</span>
        </div>
      );
    case "chip":
      return (
        <div
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white shadow-tile"
          style={{ background: hue }}
        >
          {s.label}
        </div>
      );
    case "icon":
      return (
        <div
          className="flex items-center justify-center rounded-2xl bg-white p-3 text-white shadow-tile"
          style={{ background: hue }}
        >
          <IconForLabel label={s.label} />
        </div>
      );
    case "lock":
      return (
        <div
          className="flex aspect-square items-center justify-center rounded-2xl text-white shadow-tile"
          style={{ background: hue, minWidth: "44px" }}
        >
          <Lock className="h-5 w-5" strokeWidth={2.4} />
        </div>
      );
    case "key":
      return (
        <div
          className="flex aspect-square items-center justify-center rounded-2xl text-white shadow-tile"
          style={{ background: hue, minWidth: "44px" }}
        >
          <Key className="h-5 w-5" strokeWidth={2.4} />
        </div>
      );
    case "envelope":
      return (
        <div className="flex flex-col items-center gap-1">
          <div
            className="flex aspect-[4/3] w-14 items-center justify-center rounded-md border-2 bg-white shadow-tile"
            style={{ borderColor: hue }}
          >
            <Mail className="h-6 w-6" strokeWidth={2} style={{ color: hue }} />
          </div>
          {s.label && (
            <span className="rounded-full bg-foreground/85 px-1.5 py-px text-[9.5px] font-semibold text-background">
              {s.label}
            </span>
          )}
        </div>
      );
    case "text":
    default:
      return (
        <div
          className="rounded-md bg-foreground px-2.5 py-1 text-[11px] font-semibold text-background shadow-ios-sm"
          style={{ background: hue }}
        >
          {s.label}
        </div>
      );
  }
}

function IconForLabel({ label }: { label: string }) {
  // Map common labels to lucide icons. Falls back to FileText.
  if (/server|サーバ/i.test(label)) return <Server className="h-5 w-5" />;
  if (/phone|端末|スマホ/i.test(label)) return <Smartphone className="h-5 w-5" />;
  if (/skull|攻撃|botnet|ボット/i.test(label)) return <Skull className="h-5 w-5" />;
  if (/hash|ハッシュ/i.test(label)) return <Hash className="h-5 w-5" />;
  if (/shield|waf|防御/i.test(label)) return <Shield className="h-5 w-5" />;
  return <FileText className="h-5 w-5" />;
}

// ── Tween helpers ──────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

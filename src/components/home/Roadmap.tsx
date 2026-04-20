import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import type { RoadmapMajor, RoadmapMinor, RoadmapTopic } from "@/server/queries/roadmap";

// ── Visual tokens ─────────────────────────────────────────────────────────

const MAJOR_VISUAL: Record<
  string,
  {
    bg: string;       // gradient background class
    gradId: string;   // SVG gradient id
    gradFrom: string; // stroke gradient start
    gradTo: string;   // stroke gradient end
    accent: string;   // solo accent color
  }
> = {
  strategy: {
    bg: "bg-grad-purple",
    gradId: "roadmap-strategy",
    gradFrom: "#FFB3FF",
    gradTo: "#FFE9A8",
    accent: "#FFD166",
  },
  management: {
    bg: "bg-grad-ocean",
    gradId: "roadmap-management",
    gradFrom: "#7BE0FF",
    gradTo: "#B9FBE0",
    accent: "#7BE0FF",
  },
  technology: {
    bg: "bg-grad-green",
    gradId: "roadmap-technology",
    gradFrom: "#9BF7D8",
    gradTo: "#FFF59D",
    accent: "#9BF7D8",
  },
};

// Layout constants (in SVG user units).
const W = 560;
const CX = W / 2;
const AMP = 170;           // horizontal wave amplitude
const STEP = 78;           // vertical space per topic node
const MINOR_H = 44;        // vertical space for minor label
const MINOR_GAP = 18;      // blank gap between minors
const PAD_TOP = 24;
const PAD_BOTTOM = 32;

type LayoutItem =
  | { kind: "minor"; y: number; minor: RoadmapMinor }
  | { kind: "node"; y: number; cx: number; topic: RoadmapTopic; index: number };

function layoutFor(major: RoadmapMajor) {
  const items: LayoutItem[] = [];
  let y = PAD_TOP;
  let globalIdx = 0;
  for (const minor of major.minors) {
    items.push({ kind: "minor", y, minor });
    y += MINOR_H;
    minor.topics.forEach((topic, i) => {
      // Wave with a slight phase offset per minor for visual variety.
      const phase = minor.minorTopic.length % 5;
      const cx = CX + AMP * Math.sin((globalIdx + phase) * 0.74);
      items.push({ kind: "node", y, cx, topic, index: globalIdx });
      globalIdx += 1;
      y += STEP;
    });
    y += MINOR_GAP;
  }
  return { items, height: Math.max(y + PAD_BOTTOM, 320) };
}

/**
 * Home-screen learning roadmap.
 *
 * Renders each major category as a "constellation" — a winding SVG path
 * with glowing topic nodes along it. Progress is visualised by filling
 * the spine from the start up to the furthest mastered node, plus each
 * node's state (未挑戦 / 伸ばす / 定着 / 習熟). No question stems or IDs
 * are exposed; nodes only link to topic-filtered session starts.
 */
export function Roadmap({
  majors,
  signedIn,
}: {
  majors: RoadmapMajor[];
  signedIn: boolean;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between px-1">
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Your Roadmap
          </div>
          <div className="mt-0.5 text-[22px] font-semibold tracking-tight">
            学びの星座
          </div>
          <div className="text-[12.5px] text-muted-foreground">
            論点を点で結び、進めるほど経路が光る
          </div>
        </div>
        <Link
          href="/topics"
          className="text-[13px] font-semibold text-primary transition-opacity hover:opacity-80"
        >
          すべて
        </Link>
      </div>

      <div className="space-y-5">
        {majors.map((m) => (
          <Constellation key={m.major} major={m} signedIn={signedIn} />
        ))}
      </div>

      <Legend signedIn={signedIn} />
    </section>
  );
}

// ── Per-major constellation ───────────────────────────────────────────────

function Constellation({
  major,
  signedIn,
}: {
  major: RoadmapMajor;
  signedIn: boolean;
}) {
  const v = MAJOR_VISUAL[major.major] ?? MAJOR_VISUAL.technology;
  const { items, height: H } = layoutFor(major);

  const nodes = items.filter((x): x is Extract<LayoutItem, { kind: "node" }> => x.kind === "node");
  const minors = items.filter((x): x is Extract<LayoutItem, { kind: "minor" }> => x.kind === "minor");

  // Smooth path through every node (mid-anchored cubic bezier).
  const pathD = nodes
    .map((n, i) => {
      if (i === 0) return `M ${n.cx} ${n.y}`;
      const prev = nodes[i - 1];
      const my = (prev.y + n.y) / 2;
      return `C ${prev.cx} ${my}, ${n.cx} ${my}, ${n.cx} ${n.y}`;
    })
    .join(" ");

  // How far up the constellation the user has lit.
  const totalNodes = nodes.length;
  const litUpTo = nodes.reduce((best, n, i) => (n.topic.level >= 2 ? i : best), -1);
  const progressPct = totalNodes > 0 ? (litUpTo + 1) / totalNodes : 0;

  // "You are here" = first non-mastered node (level < 3), or the last one.
  let currentIndex = -1;
  if (signedIn && totalNodes > 0) {
    const firstNonMastered = nodes.findIndex((n) => n.topic.level < 3);
    currentIndex = firstNonMastered === -1 ? totalNodes - 1 : firstNonMastered;
  }

  const mastered = major.masteredCount;
  const attempted = major.attemptedCount;
  const overallPct =
    major.topicCount === 0
      ? 0
      : Math.round(((attempted + mastered) / (major.topicCount * 2)) * 100);

  return (
    <div className={`relative overflow-hidden rounded-3xl text-white shadow-hero ${v.bg}`}>
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
      {/* Starfield — tiny dots */}
      <Starfield />

      {/* Header */}
      <div className="relative z-10 flex items-start gap-4 p-5 pb-0">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/25 backdrop-blur">
          <Sparkles className="h-5 w-5" strokeWidth={2.2} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-75">
            {major.minors.length} areas · {totalNodes} topics
          </div>
          <div className="mt-0.5 text-[20px] font-semibold leading-tight tracking-tight">
            {major.label}
          </div>
          <div className="mt-0.5 text-[12.5px] opacity-85">{major.intro}</div>
        </div>
        {signedIn && (
          <div className="text-right">
            <div className="num text-[26px] font-semibold leading-none tracking-tight">
              {overallPct}
              <span className="ml-0.5 text-[11px] font-medium opacity-70">%</span>
            </div>
            <div className="text-[9.5px] font-semibold uppercase tracking-[0.14em] opacity-70">
              習熟度
            </div>
          </div>
        )}
      </div>

      {/* Constellation */}
      <div
        className="relative z-10 mx-auto mt-3"
        style={{ aspectRatio: `${W}/${H}`, width: "100%" }}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id={v.gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={v.gradFrom} stopOpacity={0.95} />
              <stop offset="100%" stopColor={v.gradTo} stopOpacity={0.95} />
            </linearGradient>
            <filter id={`${v.gradId}-glow`} x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background spine (dashed) */}
          <path
            d={pathD}
            stroke="rgba(255,255,255,0.22)"
            strokeWidth={2}
            fill="none"
            strokeDasharray="2 8"
            strokeLinecap="round"
          />
          {/* Lit progress spine */}
          {progressPct > 0 && (
            <path
              d={pathD}
              stroke={`url(#${v.gradId})`}
              strokeWidth={3.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={`${progressPct} 1`}
              filter={`url(#${v.gradId}-glow)`}
            />
          )}

          {/* Connector stubs to minor labels (subtle tick marks) */}
          {minors.map((m, i) => (
            <line
              key={`minor-${i}`}
              x1={CX - 12}
              y1={m.y + MINOR_H / 2 + 6}
              x2={CX + 12}
              y2={m.y + MINOR_H / 2 + 6}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth={1}
              strokeLinecap="round"
            />
          ))}

          {/* Nodes */}
          {nodes.map((n) => (
            <NodeGlyph
              key={n.topic.slug}
              cx={n.cx}
              cy={n.y}
              level={n.topic.level}
              current={signedIn && n.index === currentIndex && n.topic.level < 3}
            />
          ))}
        </svg>

        {/* HTML overlays: minor labels + node labels */}
        {minors.map((m, i) => (
          <div
            key={`lbl-minor-${i}`}
            className="pointer-events-none absolute left-0 right-0 flex items-center justify-center"
            style={{ top: `${(m.y / H) * 100}%`, height: `${(MINOR_H / H) * 100}%` }}
          >
            <div className="rounded-full bg-white/12 px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/90 ring-1 ring-inset ring-white/20 backdrop-blur">
              {m.minor.minorTopic}
              {signedIn && m.minor.masteredCount > 0 && (
                <span className="ml-1.5 text-white/70">
                  {m.minor.masteredCount}/{m.minor.topicCount}
                </span>
              )}
            </div>
          </div>
        ))}

        {nodes.map((n) => {
          const leftSide = n.cx < CX;
          return (
            <Link
              key={`lbl-${n.topic.slug}`}
              href={`/learn/session/new?mode=topic&topic=${n.topic.slug}&count=5`}
              className="group absolute transition-transform active:scale-[0.97]"
              style={{
                top: `${(n.y / H) * 100}%`,
                left: leftSide ? undefined : `${(n.cx / W) * 100}%`,
                right: leftSide ? `${((W - n.cx) / W) * 100}%` : undefined,
                transform: "translateY(-50%)",
                width: "calc(50% - 32px)",
                marginLeft: leftSide ? 0 : 22,
                marginRight: leftSide ? 22 : 0,
              }}
            >
              <div
                className={`truncate text-[13px] font-semibold leading-tight ${
                  n.topic.level === 0 ? "text-white/55" : "text-white"
                } ${leftSide ? "text-right" : "text-left"}`}
              >
                {n.topic.title}
              </div>
              {signedIn && n.topic.attempted > 0 && (
                <div
                  className={`num mt-0.5 text-[10.5px] ${
                    leftSide ? "text-right" : "text-left"
                  } opacity-75`}
                >
                  {Math.round(n.topic.correctRate * 100)}% · {n.topic.correct}/
                  {n.topic.attempted}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer — quick facts */}
      {signedIn && (
        <div className="relative z-10 grid grid-cols-3 gap-3 border-t border-white/10 bg-black/10 px-5 py-4 text-[11px] font-medium">
          <FooterCell label="習熟" value={`${mastered}`} />
          <FooterCell label="学習中" value={`${attempted - mastered}`} />
          <FooterCell label="未挑戦" value={`${major.topicCount - attempted}`} />
        </div>
      )}
    </div>
  );
}

// ── Node glyph ─────────────────────────────────────────────────────────────

function NodeGlyph({
  cx,
  cy,
  level,
  current,
}: {
  cx: number;
  cy: number;
  level: 0 | 1 | 2 | 3;
  current: boolean;
}) {
  const FILL = {
    0: { ring: "rgba(255,255,255,0.35)", body: "rgba(255,255,255,0.04)", r: 7 },
    1: { ring: "#FF9F0A", body: "#FF9500", r: 8.5 },
    2: { ring: "#64D2FF", body: "#0A84FF", r: 9.5 },
    3: { ring: "#B9FBC0", body: "#30D158", r: 10.5 },
  }[level];

  return (
    <g>
      {/* Soft halo for filled nodes */}
      {level >= 1 && (
        <circle
          cx={cx}
          cy={cy}
          r={FILL.r + 10}
          fill={FILL.body}
          opacity={level === 3 ? 0.28 : 0.16}
          style={{ filter: "blur(6px)" }}
        />
      )}

      {/* You-are-here pulse */}
      {current && (
        <>
          <circle
            cx={cx}
            cy={cy}
            r={FILL.r + 6}
            fill="none"
            stroke="white"
            strokeOpacity="0.9"
            strokeWidth="1.5"
          >
            <animate attributeName="r" values={`${FILL.r + 6};${FILL.r + 14};${FILL.r + 6}`} dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="stroke-opacity" values="0.9;0.1;0.9" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle
            cx={cx}
            cy={cy}
            r={FILL.r + 3}
            fill="none"
            stroke="white"
            strokeOpacity="0.5"
            strokeWidth="1"
          />
        </>
      )}

      {/* Outer ring (reveals state even when filled) */}
      <circle
        cx={cx}
        cy={cy}
        r={FILL.r}
        fill={FILL.body}
        stroke={FILL.ring}
        strokeWidth={level === 0 ? 1.5 : 2}
      />

      {/* Inner jewel for mastered */}
      {level === 3 && (
        <g transform={`translate(${cx} ${cy})`}>
          <circle r={FILL.r - 3} fill="white" opacity={0.95} />
          <path
            d="M -3.2 0 L -1 2.2 L 3 -2"
            fill="none"
            stroke="#30D158"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}

      {/* Inner dot for level ≥ 1 */}
      {level === 1 && (
        <circle cx={cx} cy={cy} r={FILL.r - 3.5} fill="white" opacity={0.85} />
      )}
      {level === 2 && (
        <circle cx={cx} cy={cy} r={FILL.r - 3.5} fill="white" opacity={0.95} />
      )}
    </g>
  );
}

// ── Starfield ──────────────────────────────────────────────────────────────

function Starfield() {
  // Deterministic pseudo-random star positions (hashed indices).
  const stars = Array.from({ length: 22 }).map((_, i) => {
    const x = (Math.sin(i * 91.17) + 1) / 2;
    const y = (Math.cos(i * 53.3) + 1) / 2;
    const o = 0.25 + ((i * 37) % 50) / 100;
    const s = 1 + ((i * 17) % 3);
    return { x, y, o, s };
  });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x * 100}%`,
            top: `${s.y * 100}%`,
            width: s.s,
            height: s.s,
            opacity: s.o * 0.5,
            filter: "blur(0.2px)",
          }}
        />
      ))}
    </div>
  );
}

// ── Footer cell ────────────────────────────────────────────────────────────

function FooterCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="num text-[16px] font-semibold tracking-tight">{value}</div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] opacity-70">
        {label}
      </div>
    </div>
  );
}

// ── Legend ─────────────────────────────────────────────────────────────────

function Legend({ signedIn }: { signedIn: boolean }) {
  const items = signedIn
    ? [
        { color: "bg-ios-green", label: "習熟" },
        { color: "bg-ios-blue", label: "定着" },
        { color: "bg-ios-orange", label: "伸ばす" },
        { color: "bg-white/20", label: "未挑戦" },
      ]
    : [
        { color: "bg-white/20", label: "ログインで進捗が色で可視化されます" },
      ];
  return (
    <div className="flex flex-wrap items-center gap-3 px-1 text-[11px] text-muted-foreground">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${it.color}`} />
          {it.label}
        </div>
      ))}
    </div>
  );
}

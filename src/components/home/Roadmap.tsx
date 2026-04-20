import Link from "next/link";
import { Check } from "lucide-react";
import type {
  RoadmapMajor,
  RoadmapMinor,
  RoadmapTopic,
} from "@/server/queries/roadmap";

// ── Visual tokens ─────────────────────────────────────────────────────────

const MAJOR_VISUAL: Record<
  string,
  {
    bg: string;         // gradient background class
    spineColor: string; // fill color for progress spine
    spineGlow: string;  // matching glow
  }
> = {
  strategy: {
    bg: "bg-grad-purple",
    spineColor: "linear-gradient(to bottom, #FFB3FF, #FFE9A8)",
    spineGlow: "shadow-[0_0_14px_rgba(255,200,140,0.55)]",
  },
  management: {
    bg: "bg-grad-ocean",
    spineColor: "linear-gradient(to bottom, #7BE0FF, #B9FBE0)",
    spineGlow: "shadow-[0_0_14px_rgba(123,224,255,0.55)]",
  },
  technology: {
    bg: "bg-grad-green",
    spineColor: "linear-gradient(to bottom, #9BF7D8, #FFF59D)",
    spineGlow: "shadow-[0_0_14px_rgba(155,247,216,0.55)]",
  },
};

/**
 * Home-screen learning roadmap.
 *
 * A vertical skill tree per major category: a central spine that lights
 * up with progress, with topic nodes branching left/right on alternating
 * rows. Minor-area pills divide the spine into readable chapters.
 *
 * Design choices for readability:
 *   • Two-column alternation (not a continuous wave) — easy to scan.
 *   • Labels get room, wrap up to 2 lines, never truncate aggressively.
 *   • Node badges carry the state visually (size, fill, glyph).
 *   • Minor pills interrupt the spine as horizontal dividers.
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
            論点を点で結ぶ。進めるほど経路が光る。
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

// ── Per-major constellation card ──────────────────────────────────────────

function Constellation({
  major,
  signedIn,
}: {
  major: RoadmapMajor;
  signedIn: boolean;
}) {
  const v = MAJOR_VISUAL[major.major] ?? MAJOR_VISUAL.technology;

  // Flatten topics while remembering where each minor starts.
  const flat: RoadmapTopic[] = major.minors.flatMap((m) => m.topics);
  const totalNodes = flat.length;

  // Progress = ratio of 定着+習熟 (level ≥ 2) nodes.
  const litCount = flat.filter((t) => t.level >= 2).length;
  const progressPct = totalNodes > 0 ? litCount / totalNodes : 0;

  // "You are here" — first non-mastered node index, or last if all mastered.
  let currentIdx = -1;
  if (signedIn && totalNodes > 0) {
    const firstNonMastered = flat.findIndex((n) => n.level < 3);
    currentIdx = firstNonMastered === -1 ? totalNodes - 1 : firstNonMastered;
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
      <Starfield />

      {/* Header */}
      <div className="relative z-10 flex items-start gap-4 p-5">
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

      {/* Spine + nodes */}
      <div className="relative z-10 px-3 pb-2 sm:px-6">
        {/* Background spine */}
        <div className="pointer-events-none absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2">
          <div
            className="absolute inset-0 bg-gradient-to-b from-white/25 via-white/10 to-transparent"
            style={{ maskImage: "linear-gradient(to bottom, black, black, transparent)" }}
          />
          {/* Lit progress spine */}
          {progressPct > 0 && (
            <div
              className={`absolute inset-x-0 top-0 rounded-full ${v.spineGlow}`}
              style={{
                height: `${progressPct * 100}%`,
                background: v.spineColor,
              }}
            />
          )}
        </div>

        {/* Render minors */}
        <div className="relative">
          {major.minors.map((minor, mi) => {
            const baseIdx = major.minors
              .slice(0, mi)
              .reduce((n, mm) => n + mm.topics.length, 0);
            return (
              <MinorBlock
                key={`${minor.minorTopic}-${mi}`}
                minor={minor}
                baseIdx={baseIdx}
                currentIdx={currentIdx}
                signedIn={signedIn}
                first={mi === 0}
              />
            );
          })}
        </div>
      </div>

      {/* Footer stats */}
      {signedIn && (
        <div className="relative z-10 mt-1 grid grid-cols-3 gap-3 border-t border-white/10 bg-black/10 px-5 py-4 text-[11px]">
          <FooterCell label="習熟" value={`${mastered}`} accent="text-white" />
          <FooterCell
            label="学習中"
            value={`${Math.max(0, attempted - mastered)}`}
            accent="text-white"
          />
          <FooterCell
            label="未挑戦"
            value={`${Math.max(0, major.topicCount - attempted)}`}
            accent="text-white/75"
          />
        </div>
      )}
    </div>
  );
}

// ── Minor block: divider pill + its topic rows ────────────────────────────

function MinorBlock({
  minor,
  baseIdx,
  currentIdx,
  signedIn,
  first,
}: {
  minor: RoadmapMinor;
  baseIdx: number;
  currentIdx: number;
  signedIn: boolean;
  first: boolean;
}) {
  return (
    <div>
      {/* Chapter marker */}
      <div className={`relative flex items-center justify-center ${first ? "pt-1" : "pt-4"} pb-1`}>
        {/* Horizontal accent stubs mask the spine */}
        <div className="relative inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] ring-1 ring-inset ring-white/25 backdrop-blur">
          <span>{minor.minorTopic}</span>
          {signedIn && minor.topicCount > 0 && (
            <span className="inline-flex items-center gap-0.5">
              {Array.from({ length: minor.topicCount }).map((_, i) => (
                <span
                  key={i}
                  className={`h-1 w-1 rounded-full ${
                    i < minor.masteredCount ? "bg-white" : "bg-white/35"
                  }`}
                />
              ))}
            </span>
          )}
        </div>
      </div>

      {/* Topic rows */}
      <div>
        {minor.topics.map((topic, i) => {
          const absoluteIdx = baseIdx + i;
          const side: "left" | "right" = absoluteIdx % 2 === 0 ? "left" : "right";
          return (
            <TopicRow
              key={topic.slug}
              topic={topic}
              side={side}
              signedIn={signedIn}
              current={absoluteIdx === currentIdx && topic.level < 3}
            />
          );
        })}
      </div>
    </div>
  );
}

// ── Topic row: label | node | label (grid with stubs) ────────────────────

function TopicRow({
  topic,
  side,
  signedIn,
  current,
}: {
  topic: RoadmapTopic;
  side: "left" | "right";
  signedIn: boolean;
  current: boolean;
}) {
  return (
    <Link
      href={`/learn/session/new?mode=topic&topic=${topic.slug}&count=5`}
      className="group relative grid min-h-[62px] grid-cols-[1fr_40px_1fr] items-center transition-transform active:scale-[0.99]"
    >
      {/* Left label */}
      <div
        className={`flex items-center justify-end pr-2 ${
          side === "left" ? "" : "pointer-events-none opacity-0"
        }`}
      >
        <TopicLabel topic={topic} align="right" signedIn={signedIn} />
      </div>

      {/* Node column */}
      <div className="relative flex h-full items-center justify-center">
        {/* Branch stub — horizontal line from node outward to label */}
        <div
          className={`absolute top-1/2 h-[2px] w-3 -translate-y-1/2 rounded-full bg-white/25 ${
            side === "left" ? "right-[26px]" : "left-[26px]"
          } transition-colors group-hover:bg-white/50`}
        />
        <NodeBadge level={topic.level} current={current} />
      </div>

      {/* Right label */}
      <div
        className={`flex items-center justify-start pl-2 ${
          side === "right" ? "" : "pointer-events-none opacity-0"
        }`}
      >
        <TopicLabel topic={topic} align="left" signedIn={signedIn} />
      </div>
    </Link>
  );
}

// ── Label shown on one side of the row ───────────────────────────────────

function TopicLabel({
  topic,
  align,
  signedIn,
}: {
  topic: RoadmapTopic;
  align: "left" | "right";
  signedIn: boolean;
}) {
  return (
    <div className={align === "right" ? "text-right" : "text-left"}>
      <div
        className={`line-clamp-2 text-[13.5px] font-semibold leading-tight ${
          topic.level === 0 ? "text-white/65" : "text-white"
        }`}
      >
        {topic.title}
      </div>
      {signedIn && topic.attempted > 0 ? (
        <div className="num mt-0.5 text-[10.5px] opacity-75">
          {Math.round(topic.correctRate * 100)}% · {topic.correct}/{topic.attempted}
        </div>
      ) : (
        <div className="mt-0.5 text-[10.5px] opacity-60">
          {topic.level === 0 ? "未挑戦" : ""}
        </div>
      )}
    </div>
  );
}

// ── Node badge (on the spine) ────────────────────────────────────────────

function NodeBadge({
  level,
  current,
}: {
  level: 0 | 1 | 2 | 3;
  current: boolean;
}) {
  const size =
    level === 3 ? 28 : level === 2 ? 26 : level === 1 ? 24 : 20;

  const LEVEL = {
    0: {
      ring: "ring-white/35",
      bg: "bg-white/8",
      inner: null,
    },
    1: {
      ring: "ring-[#FF9F0A]/80",
      bg: "bg-[#FF9500]",
      inner: (
        <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
      ),
    },
    2: {
      ring: "ring-[#64D2FF]/90",
      bg: "bg-[#0A84FF]",
      inner: (
        <span className="flex gap-0.5">
          <span className="h-1.5 w-1.5 rounded-full bg-white/95" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/95" />
        </span>
      ),
    },
    3: {
      ring: "ring-[#B9FBC0]",
      bg: "bg-[#30D158]",
      inner: <Check className="h-3.5 w-3.5 text-white" strokeWidth={3.2} />,
    },
  }[level];

  return (
    <span
      className="relative flex shrink-0 items-center justify-center"
      style={{ width: size + 4, height: size + 4 }}
    >
      {/* Glow */}
      {level >= 1 && (
        <span
          className={`absolute inset-[-6px] rounded-full ${
            level === 3
              ? "bg-[#30D158]/30"
              : level === 2
              ? "bg-[#0A84FF]/30"
              : "bg-[#FF9500]/30"
          } blur-md`}
        />
      )}

      {/* Pulse ring for "you are here" */}
      {current && (
        <>
          <span className="absolute inset-[-10px] animate-ping rounded-full border-2 border-white/70" />
          <span className="absolute inset-[-4px] rounded-full border border-white/80" />
        </>
      )}

      {/* Core */}
      <span
        className={`relative flex items-center justify-center rounded-full ring-2 ${LEVEL.ring} ${LEVEL.bg} ${
          level === 0 ? "backdrop-blur" : "shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
        }`}
        style={{ width: size, height: size }}
      >
        {LEVEL.inner}
      </span>
    </span>
  );
}

// ── Starfield backdrop ────────────────────────────────────────────────────

function Starfield() {
  const stars = Array.from({ length: 24 }).map((_, i) => {
    const x = (Math.sin(i * 91.17) + 1) / 2;
    const y = (Math.cos(i * 53.3) + 1) / 2;
    const o = 0.2 + ((i * 37) % 50) / 100;
    const s = 1 + ((i * 17) % 3);
    return { x, y, o, s };
  });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((st, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${st.x * 100}%`,
            top: `${st.y * 100}%`,
            width: st.s,
            height: st.s,
            opacity: st.o * 0.5,
            filter: "blur(0.2px)",
          }}
        />
      ))}
    </div>
  );
}

// ── Footer cell ──────────────────────────────────────────────────────────

function FooterCell({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="text-center">
      <div className={`num text-[16px] font-semibold tracking-tight ${accent}`}>
        {value}
      </div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] opacity-70">
        {label}
      </div>
    </div>
  );
}

// ── Legend ──────────────────────────────────────────────────────────────

function Legend({ signedIn }: { signedIn: boolean }) {
  if (!signedIn) {
    return (
      <div className="px-1 text-[11.5px] text-muted-foreground">
        ログインで、解いた論点が経路上で色として可視化されます。
      </div>
    );
  }
  const items = [
    { color: "bg-[#30D158]", label: "習熟" },
    { color: "bg-[#0A84FF]", label: "定着" },
    { color: "bg-[#FF9500]", label: "伸ばす" },
    { color: "bg-muted-foreground/40", label: "未挑戦" },
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

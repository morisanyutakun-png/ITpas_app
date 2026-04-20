import Link from "next/link";
import { ArrowUpRight, ChevronRight, Circle, Sparkles } from "lucide-react";
import type {
  RoadmapMajor,
  RoadmapMinor,
  RoadmapTopic,
} from "@/server/queries/roadmap";

// ── Visual tokens ─────────────────────────────────────────────────────────

const MAJOR_VISUAL: Record<
  string,
  {
    hue: string;      // ring hue + accents (hex)
    hueDim: string;   // track hue (hex, ~15% opacity look)
    grad: string;     // small accent tile gradient class
    label: string;    // kicker label
  }
> = {
  strategy: {
    hue: "#FF375F",
    hueDim: "rgba(255,55,95,0.14)",
    grad: "bg-grad-strategy",
    label: "STRATEGY",
  },
  management: {
    hue: "#FF9500",
    hueDim: "rgba(255,149,0,0.14)",
    grad: "bg-grad-management",
    label: "MANAGEMENT",
  },
  technology: {
    hue: "#0A84FF",
    hueDim: "rgba(10,132,255,0.14)",
    grad: "bg-grad-technology",
    label: "TECHNOLOGY",
  },
};

/**
 * Home roadmap — Apple Fitness-style.
 *
 *   1. Hero: three nested activity rings (one per major) + macro summary.
 *   2. Editorial chapter cards per major with minor-area breakdowns.
 *
 * No more flat gradient walls — each component earns its visual weight with
 * real data structure (ring fill, segmented mastery bar, next-topic pick).
 */
export function Roadmap({
  majors,
  signedIn,
}: {
  majors: RoadmapMajor[];
  signedIn: boolean;
}) {
  const totals = majors.reduce(
    (a, m) => ({
      topics: a.topics + m.topicCount,
      mastered: a.mastered + m.masteredCount,
      attempted: a.attempted + m.attemptedCount,
    }),
    { topics: 0, mastered: 0, attempted: 0 }
  );
  const overallPct =
    totals.topics > 0 ? Math.round((totals.mastered / totals.topics) * 100) : 0;

  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between px-1">
        <div>
          <div className="kicker">Your Roadmap</div>
          <div className="mt-2 text-[22px] font-semibold tracking-tight">
            学習の全体像
          </div>
          <div className="text-[12.5px] text-muted-foreground">
            3大領域の進捗とアクティブな論点
          </div>
        </div>
        <Link
          href="/topics"
          className="inline-flex items-center gap-0.5 text-[12px] font-medium text-muted-foreground active:opacity-70"
        >
          すべて <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <RingsHero
        majors={majors}
        overallPct={overallPct}
        totals={totals}
        signedIn={signedIn}
      />

      <div className="space-y-3">
        {majors.map((m) => (
          <ChapterCard key={m.major} major={m} signedIn={signedIn} />
        ))}
      </div>
    </section>
  );
}

// ── Rings hero (Apple Fitness-style) ─────────────────────────────────────

function RingsHero({
  majors,
  overallPct,
  totals,
  signedIn,
}: {
  majors: RoadmapMajor[];
  overallPct: number;
  totals: { topics: number; mastered: number; attempted: number };
  signedIn: boolean;
}) {
  const size = 190;
  const stroke = 14;
  const gap = 4;

  return (
    <div className="editorial-card p-5 sm:p-6">
      <div className="relative z-10 grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="relative mx-auto" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="-rotate-90"
          >
            {majors.map((m, i) => {
              const v = MAJOR_VISUAL[m.major];
              const r = (size - stroke) / 2 - i * (stroke + gap);
              if (r <= 0) return null;
              const c = 2 * Math.PI * r;
              const pct =
                m.topicCount > 0 ? m.masteredCount / m.topicCount : 0;
              const dash = pct * c;
              return (
                <g key={m.major}>
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke={v.hueDim}
                    strokeWidth={stroke}
                  />
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke={v.hue}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={`${dash} ${c}`}
                    style={{
                      filter: `drop-shadow(0 0 6px ${v.hue}33)`,
                      transition: "stroke-dasharray 700ms ease-out",
                    }}
                  />
                </g>
              );
            })}
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <div className="num text-[30px] font-semibold leading-none tracking-tight">
                {overallPct}
                <span className="ml-0.5 text-[13px] font-medium text-muted-foreground">
                  %
                </span>
              </div>
              <div className="mt-0.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Mastery
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            {majors.map((m) => {
              const v = MAJOR_VISUAL[m.major];
              const pct =
                m.topicCount > 0
                  ? Math.round((m.masteredCount / m.topicCount) * 100)
                  : 0;
              return (
                <div
                  key={m.major}
                  className="flex items-center gap-3"
                >
                  <span
                    aria-hidden
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      background: v.hue,
                      boxShadow: `0 0 8px ${v.hue}66`,
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between text-[12.5px]">
                      <span className="font-medium">{m.label}</span>
                      <span className="num text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          {m.masteredCount}
                        </span>
                        {" / "}
                        {m.topicCount}
                      </span>
                    </div>
                    <div
                      className="mt-1 h-1 overflow-hidden rounded-full"
                      style={{ background: v.hueDim }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(2, pct)}%`,
                          background: v.hue,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {signedIn && (
            <div className="flex items-center gap-4 border-t border-border pt-3 text-[11px]">
              <SummaryCell
                label="論点"
                value={totals.topics}
                accent="text-foreground"
              />
              <span aria-hidden className="h-6 w-px bg-border" />
              <SummaryCell
                label="学習中"
                value={totals.attempted - totals.mastered}
                accent="text-ios-orange"
              />
              <span aria-hidden className="h-6 w-px bg-border" />
              <SummaryCell
                label="習熟"
                value={totals.mastered}
                accent="text-ios-green"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCell({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="flex-1">
      <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </div>
      <div className={`num mt-0.5 text-[18px] font-semibold tracking-tight ${accent}`}>
        {value}
      </div>
    </div>
  );
}

// ── Chapter card per major ──────────────────────────────────────────────

function ChapterCard({
  major,
  signedIn,
}: {
  major: RoadmapMajor;
  signedIn: boolean;
}) {
  const v = MAJOR_VISUAL[major.major];
  const flat: RoadmapTopic[] = major.minors.flatMap((m) => m.topics);
  const pct =
    major.topicCount > 0
      ? Math.round((major.masteredCount / major.topicCount) * 100)
      : 0;

  // Next topic pick: first topic with level < 3, lowest correctRate if any,
  // else the first attempted one. This is the editorial "up next" suggestion.
  const next =
    flat
      .filter((t) => t.level < 3)
      .sort((a, b) => {
        if (a.attempted === 0 && b.attempted > 0) return 1; // prefer attempted first
        if (b.attempted === 0 && a.attempted > 0) return -1;
        return a.correctRate - b.correctRate;
      })[0] ?? flat[0];

  return (
    <div className="surface-card overflow-hidden">
      {/* Header: color bar + name + big number */}
      <div className="relative flex items-center gap-4 p-5">
        <div
          aria-hidden
          className="absolute inset-y-3 left-0 w-1 rounded-r-full"
          style={{ background: v.hue }}
        />
        <div className="min-w-0 flex-1 pl-2">
          <div
            className="text-[10.5px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: v.hue }}
          >
            {v.label} · {major.minors.length} areas
          </div>
          <div className="mt-1 text-[22px] font-semibold leading-tight tracking-tight">
            {major.label}
          </div>
          <div className="text-[12px] text-muted-foreground">
            {major.intro}
          </div>
        </div>
        {signedIn && (
          <div className="text-right">
            <div className="num text-[26px] font-semibold leading-none tracking-tight">
              {pct}
              <span className="ml-0.5 text-[12px] font-medium text-muted-foreground">
                %
              </span>
            </div>
            <div className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Mastery
            </div>
          </div>
        )}
      </div>

      {/* Minor areas — segmented mastery bar */}
      <div className="space-y-2.5 border-t border-border px-5 py-4">
        {major.minors.map((minor) => (
          <MinorRow key={minor.minorTopic} minor={minor} hue={v.hue} />
        ))}
      </div>

      {/* Footer: up-next topic CTA */}
      {signedIn && next && (
        <Link
          href={`/learn/session/new?mode=topic&topic=${next.slug}&count=5`}
          className="group flex items-center gap-3 border-t border-border bg-muted/40 px-5 py-4 transition-colors hover:bg-muted/70"
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-tile"
            style={{ background: v.hue }}
          >
            <Sparkles className="h-4 w-4" strokeWidth={2.4} />
          </span>
          <div className="min-w-0 flex-1">
            <div
              className="text-[10.5px] font-semibold uppercase tracking-[0.12em]"
              style={{ color: v.hue }}
            >
              Up Next · 5問で攻める
            </div>
            <div className="truncate text-[14.5px] font-semibold">
              {next.title}
            </div>
            {next.attempted > 0 ? (
              <div className="text-[11px] text-muted-foreground">
                正答率 {Math.round(next.correctRate * 100)}% · {next.attempted}問
              </div>
            ) : (
              <div className="text-[11px] text-muted-foreground">未挑戦</div>
            )}
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      )}
    </div>
  );
}

function MinorRow({
  minor,
  hue,
}: {
  minor: RoadmapMinor;
  hue: string;
}) {
  const topics = minor.topics;
  const total = topics.length;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-[12.5px] font-medium">
            {minor.minorTopic}
          </span>
          {minor.masteredCount === total && total > 0 && (
            <span
              className="inline-flex h-4 items-center gap-0.5 rounded-full px-1.5 text-[9px] font-semibold uppercase tracking-wider text-white"
              style={{ background: hue }}
            >
              Clear
            </span>
          )}
        </div>
        <div className="num text-[10.5px] text-muted-foreground">
          <span className="font-semibold text-foreground">
            {minor.masteredCount}
          </span>
          {" / "}
          {total}
        </div>
      </div>
      {/* Segmented bar — one tick per topic. */}
      <div className="mt-1 flex gap-[3px]">
        {topics.map((t) => (
          <LevelTick key={t.slug} level={t.level} hue={hue} slug={t.slug} />
        ))}
      </div>
    </div>
  );
}

function LevelTick({
  level,
  hue,
  slug,
}: {
  level: 0 | 1 | 2 | 3;
  hue: string;
  slug: string;
}) {
  // Each tick is a link to a 5-problem topic session.
  const style =
    level === 3
      ? { background: hue, opacity: 1 }
      : level === 2
      ? { background: hue, opacity: 0.55 }
      : level === 1
      ? { background: hue, opacity: 0.28 }
      : { background: "hsl(var(--muted))" };
  return (
    <Link
      href={`/learn/session/new?mode=topic&topic=${slug}&count=5`}
      className="group/tick relative flex-1 overflow-hidden rounded-full"
      style={{ height: 6 }}
    >
      <span
        className="absolute inset-0 rounded-full transition-transform group-hover/tick:scale-y-[1.6]"
        style={style}
      />
    </Link>
  );
}

/* Kept for API compatibility — unused glyph imports won't tree-shake cleanly otherwise. */
void Circle;

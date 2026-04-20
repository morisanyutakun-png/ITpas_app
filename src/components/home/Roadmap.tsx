import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import type { RoadmapMajor, RoadmapTopic } from "@/server/queries/roadmap";

const MAJOR_GRAD: Record<string, string> = {
  strategy: "bg-grad-purple",
  management: "bg-grad-ocean",
  technology: "bg-grad-green",
};
const MAJOR_ACCENT: Record<string, string> = {
  strategy: "text-ios-purple",
  management: "text-ios-blue",
  technology: "text-ios-teal",
};

/**
 * Home-screen learning roadmap.
 *
 * Shows each major category as a section with its minor areas broken out
 * as rows. Per-topic progress is visualised with 3 filled dots (未挑戦 →
 * 伸ばす → 定着 → 習熟). No question stems, no IDs, no DB leakage — the
 * only linkable destination is a session start for each topic.
 */
export function Roadmap({ majors, signedIn }: { majors: RoadmapMajor[]; signedIn: boolean }) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between px-1">
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Your Roadmap
          </div>
          <div className="mt-0.5 text-[22px] font-semibold tracking-tight">
            学習ロードマップ
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
          <MajorSection key={m.major} major={m} signedIn={signedIn} />
        ))}
      </div>
    </section>
  );
}

function MajorSection({
  major,
  signedIn,
}: {
  major: RoadmapMajor;
  signedIn: boolean;
}) {
  const grad = MAJOR_GRAD[major.major] ?? "bg-grad-ink";
  const accent = MAJOR_ACCENT[major.major] ?? "text-foreground";
  const total = major.topicCount;
  const pct =
    total === 0
      ? 0
      : Math.round(((major.attemptedCount + major.masteredCount) / (total * 2)) * 100);

  return (
    <div className="space-y-2">
      {/* Major header — gradient strip */}
      <div className={`hero-tile ${grad} !p-4`}>
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/25 backdrop-blur">
            <Sparkles className="h-4 w-4" strokeWidth={2.4} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-80">
              {major.minors.length} areas · {total} topics
            </div>
            <div className="mt-0.5 text-[17px] font-semibold leading-tight tracking-tight">
              {major.label}
            </div>
            <div className="mt-0.5 text-[12px] opacity-85">{major.intro}</div>
          </div>
          {signedIn && (
            <div className="text-right">
              <div className="num text-[22px] font-semibold leading-none tracking-tight">
                {pct}
                <span className="ml-0.5 text-[11px] font-medium opacity-70">%</span>
              </div>
              <div className="text-[9.5px] font-semibold uppercase tracking-[0.12em] opacity-70">
                習熟度
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Minor areas (rows with topic rails) */}
      <div className="ios-list">
        {major.minors.map((minor) => (
          <div key={minor.minorTopic} className="px-4 py-3.5">
            <div className="flex items-center justify-between">
              <div className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${accent}`}>
                {minor.minorTopic}
              </div>
              {signedIn && minor.masteredCount > 0 && (
                <div className="num text-[11px] font-semibold text-ios-green">
                  {minor.masteredCount}/{minor.topicCount} 習熟
                </div>
              )}
            </div>
            <div className="mt-2 space-y-1.5">
              {minor.topics.map((t) => (
                <TopicRow key={t.slug} topic={t} signedIn={signedIn} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopicRow({
  topic,
  signedIn,
}: {
  topic: RoadmapTopic;
  signedIn: boolean;
}) {
  return (
    <Link
      href={`/learn/session/new?mode=topic&topic=${topic.slug}&count=5`}
      className="group -mx-1 flex items-center gap-2.5 rounded-lg px-1 py-1.5 transition-colors active:bg-muted/60"
    >
      <ProgressDots level={topic.level} />
      <span className="flex-1 truncate text-[14px] font-medium">{topic.title}</span>
      {signedIn && topic.attempted > 0 && (
        <span className="num text-[11px] font-medium text-muted-foreground">
          {topic.correct}/{topic.attempted}
        </span>
      )}
      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70 transition-transform group-active:translate-x-0.5" />
    </Link>
  );
}

function ProgressDots({ level }: { level: 0 | 1 | 2 | 3 }) {
  const dots: Array<"on" | "warn" | "off"> = [
    level >= 1 ? (level === 1 ? "warn" : "on") : "off",
    level >= 2 ? "on" : "off",
    level >= 3 ? "on" : "off",
  ];
  return (
    <span className="flex shrink-0 items-center gap-0.5">
      {dots.map((state, i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${
            state === "on"
              ? "bg-ios-green"
              : state === "warn"
              ? "bg-ios-orange"
              : "bg-ios-gray4"
          }`}
        />
      ))}
    </span>
  );
}

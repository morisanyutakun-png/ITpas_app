"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Compass, PlayCircle, Sparkles } from "lucide-react";
import type { RoadmapMajor, RoadmapTopic } from "@/server/queries/roadmap";

const MAJOR_HUE: Record<string, { hue: string; hueDim: string; label: string }> = {
  strategy: {
    hue: "#FF375F",
    hueDim: "rgba(255,55,95,0.10)",
    label: "ストラテジ系",
  },
  management: {
    hue: "#FF9500",
    hueDim: "rgba(255,149,0,0.10)",
    label: "マネジメント系",
  },
  technology: {
    hue: "#0A84FF",
    hueDim: "rgba(10,132,255,0.10)",
    label: "テクノロジ系",
  },
};

type FlatNode = {
  topic: RoadmapTopic;
  major: string;
  minorTopic: string;
  hue: string;
  /** Position: 0-1 within its major cluster column. */
  cx: number;
  cy: number;
};

/**
 * 概念マップ v0 — roadmap データを 2D で配置するクライアントビュー。
 *
 * 3 クラスタ (strategy/management/technology) をカラムに分け、minor 単位で
 * 縦に並べる。各 topic ノードは色で習熟度を示し、タップで詳細を出す。
 */
export function ConceptMapView({ roadmap }: { roadmap: RoadmapMajor[] }) {
  const [selected, setSelected] = useState<FlatNode | null>(null);

  const flat = useMemo<FlatNode[]>(() => {
    const nodes: FlatNode[] = [];
    roadmap.forEach((m, mi) => {
      const meta = MAJOR_HUE[m.major];
      const colX = (mi + 0.5) / roadmap.length;
      let row = 0;
      const totalRows = m.minors.reduce((s, x) => s + x.topicCount, 0);
      m.minors.forEach((minor) => {
        minor.topics.forEach((t) => {
          const localY = totalRows > 0 ? (row + 0.5) / totalRows : 0.5;
          nodes.push({
            topic: t,
            major: m.major,
            minorTopic: minor.minorTopic,
            hue: meta?.hue ?? "#0A84FF",
            cx: colX,
            cy: localY,
          });
          row += 1;
        });
      });
    });
    return nodes;
  }, [roadmap]);

  const totalTopics = flat.length;
  const masteredCount = flat.filter((n) => n.topic.level === 3).length;
  const attemptedCount = flat.filter((n) => n.topic.level > 0).length;
  const understoodPct =
    totalTopics > 0
      ? Math.round(((masteredCount + attemptedCount * 0.5) / totalTopics) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Hero — overall mastery */}
      <header className="surface-card relative overflow-hidden p-6 sm:p-7">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-grad-blue opacity-[0.18] blur-3xl"
        />
        <div className="relative grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <div className="kicker">Concept Map · v0</div>
            <h1 className="mt-1 text-[26px] font-semibold leading-tight tracking-tight sm:text-[30px]">
              あなたが今いる場所
            </h1>
            <p className="mt-1 max-w-[52ch] text-[13px] text-muted-foreground text-pretty">
              ITパスポートの試験範囲を 3 クラスタで配置しました。色は習熟度。
              タップして次の一歩を選びましょう。
            </p>
          </div>
          <div className="rounded-2xl bg-card px-4 py-3 ring-1 ring-black/[0.05] shadow-ios-sm dark:ring-white/[0.07]">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Understood
            </div>
            <div className="num text-[28px] font-semibold leading-none tracking-tight">
              {understoodPct}
              <span className="ml-0.5 text-[12px] font-medium text-muted-foreground">
                %
              </span>
            </div>
            <div className="mt-1 text-[10.5px] text-muted-foreground">
              {masteredCount} 習熟 / {attemptedCount} 着手 / 全 {totalTopics}
            </div>
          </div>
        </div>
      </header>

      {/* Map canvas */}
      <div
        className="surface-card relative overflow-hidden p-4 sm:p-6"
        style={{ minHeight: 480 }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 grid"
          style={{ gridTemplateColumns: `repeat(${roadmap.length}, 1fr)` }}
        >
          {roadmap.map((m) => {
            const meta = MAJOR_HUE[m.major];
            return (
              <div
                key={m.major}
                className="relative"
                style={{
                  background: `linear-gradient(180deg, ${meta?.hueDim ?? "rgba(0,0,0,0.03)"} 0%, transparent 60%)`,
                }}
              />
            );
          })}
        </div>

        <div
          className="relative grid gap-4"
          style={{ gridTemplateColumns: `repeat(${roadmap.length}, 1fr)` }}
        >
          {roadmap.map((m) => (
            <ColumnHeader key={m.major} major={m} />
          ))}
        </div>

        <div
          className="relative mt-3"
          style={{ height: 420 }}
        >
          {flat.map((n) => (
            <Node
              key={n.topic.slug}
              node={n}
              active={selected?.topic.slug === n.topic.slug}
              onClick={() =>
                setSelected((cur) =>
                  cur?.topic.slug === n.topic.slug ? null : n
                )
              }
            />
          ))}
        </div>

        {/* Legend */}
        <div className="relative mt-4 flex flex-wrap items-center gap-3 px-1 text-[11px] text-muted-foreground">
          <LegendDot color="#34C759" label="習熟 ≥85%" />
          <LegendDot color="#FFCC00" label="定着 60-85%" />
          <LegendDot color="#FF9500" label="伸ばす <60%" />
          <LegendDot color="#C7C7CC" label="未挑戦" />
        </div>
      </div>

      {/* Selected topic detail */}
      {selected && <SelectedDetail node={selected} />}
    </div>
  );
}

function ColumnHeader({ major }: { major: RoadmapMajor }) {
  const meta = MAJOR_HUE[major.major];
  const pct =
    major.topicCount > 0
      ? Math.round((major.masteredCount / major.topicCount) * 100)
      : 0;
  return (
    <div className="px-1">
      <div
        className="text-[10px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: meta?.hue }}
      >
        {meta?.label ?? major.label}
      </div>
      <div className="mt-0.5 text-[12px] text-muted-foreground">
        論点 {major.topicCount} ・ 習熟 {pct}%
      </div>
    </div>
  );
}

function Node({
  node,
  active,
  onClick,
}: {
  node: FlatNode;
  active: boolean;
  onClick: () => void;
}) {
  const fill = colorForLevel(node.topic.level, node.hue);
  const left = `${node.cx * 100}%`;
  const top = `${node.cy * 100}%`;
  return (
    <button
      onClick={onClick}
      aria-label={node.topic.title}
      className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform active:scale-90"
      style={{ left, top }}
    >
      <motion.span
        animate={
          active
            ? { scale: [1, 1.18, 1], boxShadow: `0 0 0 6px ${node.hue}33` }
            : { scale: 1 }
        }
        transition={
          active
            ? { repeat: Infinity, duration: 1.4, ease: "easeInOut" }
            : { duration: 0.2 }
        }
        className="block h-3.5 w-3.5 rounded-full"
        style={{
          background: fill,
          boxShadow: active
            ? `0 0 0 4px ${node.hue}33`
            : `0 0 0 2px ${node.hue}22`,
        }}
      />
    </button>
  );
}

function colorForLevel(level: 0 | 1 | 2 | 3, baseHue: string): string {
  switch (level) {
    case 3:
      return "#34C759";
    case 2:
      return "#FFCC00";
    case 1:
      return "#FF9500";
    default:
      return `${baseHue}66`;
  }
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-2.5 w-2.5 rounded-full"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}

function SelectedDetail({ node }: { node: FlatNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="surface-card p-5 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white"
          style={{ background: node.hue }}
        >
          <Compass className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {node.minorTopic}
          </div>
          <h3 className="mt-0.5 text-[18px] font-semibold tracking-tight">
            {node.topic.title}
          </h3>
          {node.topic.summary && (
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground text-pretty">
              {node.topic.summary}
            </p>
          )}
          <div className="mt-2 text-[11.5px] text-muted-foreground">
            {node.topic.attempted > 0 ? (
              <>
                直近の正答率{" "}
                <span className="num font-semibold text-foreground">
                  {Math.round(node.topic.correctRate * 100)}%
                </span>
                {" / "}
                <span className="num">{node.topic.attempted}</span> 問
              </>
            ) : (
              <>未挑戦の論点</>
            )}
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link
          href={`/learn/study/${node.topic.slug}`}
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-foreground px-4 text-[13px] font-semibold text-background shadow-ios active:scale-[0.98]"
        >
          <BookOpen className="h-3.5 w-3.5" />
          記事を読む
        </Link>
        <Link
          href={`/learn/session/new?mode=topic&topic=${node.topic.slug}&count=5`}
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-muted px-4 text-[13px] font-semibold text-foreground hover:bg-muted/70 active:scale-[0.98]"
        >
          <PlayCircle className="h-3.5 w-3.5" />
          関連問題で5問
        </Link>
        <Link
          href={`/topics/${node.topic.slug}`}
          className="ml-auto inline-flex h-10 items-center gap-1 rounded-full px-4 text-[12.5px] font-medium text-muted-foreground hover:text-foreground"
        >
          <Sparkles className="h-3.5 w-3.5" />
          概要
        </Link>
      </div>
    </motion.div>
  );
}

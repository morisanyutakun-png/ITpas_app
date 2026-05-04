"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, ChevronRight, Flame, Skull, Target } from "lucide-react";
import {
  ARCHETYPE_META,
  ARCHETYPE_ORDER,
  type MisconceptionArchetype,
} from "@/lib/misconceptionArchetypes";

export type BrowserItem = {
  slug: string;
  title: string;
  definition: string;
  usageCount: number;
  attempted: number;
  incorrectRate: number;
  archetype: MisconceptionArchetype | null;
};

type FilterValue = "all" | MisconceptionArchetype;

export function MisconceptionsBrowser({
  items,
  initialFilter,
}: {
  items: BrowserItem[];
  initialFilter?: FilterValue;
}) {
  const [filter, setFilter] = useState<FilterValue>(initialFilter ?? "all");

  const counts = useMemo(() => {
    const map: Record<MisconceptionArchetype, number> = {
      rephrase_trap: 0,
      hierarchy_mix: 0,
      contrast_swap: 0,
      order_reverse: 0,
      scope_misread: 0,
    };
    for (const i of items) if (i.archetype) map[i.archetype] += 1;
    return map;
  }, [items]);

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((i) => i.archetype === filter);
  }, [items, filter]);

  const enemies = filtered
    .filter((m) => m.attempted >= 2)
    .sort((a, b) => b.incorrectRate - a.incorrectRate)
    .slice(0, 3);
  const featured = enemies.length
    ? enemies
    : [...filtered].sort((a, b) => b.usageCount - a.usageCount).slice(0, 3);
  const featuredSlugs = new Set(featured.map((m) => m.slug));
  const rest = filtered.filter((m) => !featuredSlugs.has(m.slug));

  return (
    <div className="space-y-7">
      {/* 型タクソノミー切替 */}
      <section className="space-y-3">
        <div className="kicker">Trap Archetypes</div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <FilterChip
            active={filter === "all"}
            onClick={() => setFilter("all")}
            label="すべて"
            count={items.length}
            hue="#8E8E93"
            hueDim="rgba(142,142,147,0.14)"
          />
          {ARCHETYPE_ORDER.map((a) => {
            const meta = ARCHETYPE_META[a];
            const Icon = meta.icon;
            return (
              <FilterChip
                key={a}
                active={filter === a}
                onClick={() => setFilter(a)}
                label={meta.label}
                count={counts[a]}
                hue={meta.hue}
                hueDim={meta.hueDim}
                Icon={Icon}
              />
            );
          })}
        </div>
        {filter !== "all" && (
          <ActiveArchetypeDescription archetype={filter} />
        )}
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-end justify-between px-1">
            <div className="min-w-0">
              <div className="kicker">
                {enemies.length ? "Your Top Enemies" : "Most Common Traps"}
              </div>
              <div className="mt-1 text-[19px] font-semibold tracking-tight">
                {enemies.length
                  ? "あなたが取り違えやすい"
                  : "よく出るひっかけ上位"}
              </div>
              <div className="text-[12px] text-muted-foreground">
                {enemies.length
                  ? "直近の誤答傾向から導出"
                  : "登場問題数ベース"}
              </div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {featured.map((m, i) => (
              <EnemyCard
                key={m.slug}
                item={m}
                rank={i + 1}
                personalized={enemies.length > 0}
              />
            ))}
          </div>
        </section>
      )}

      {/* All */}
      {rest.length > 0 && (
        <section className="space-y-3">
          <div className="rule-label">
            {filter === "all" ? "Dictionary · すべて" : "この型のすべて"}
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {rest.map((m) => (
              <TrapCard key={m.slug} item={m} />
            ))}
          </div>
        </section>
      )}

      {filtered.length === 0 && (
        <div className="rounded-2xl bg-card p-6 text-center text-[13px] text-muted-foreground shadow-surface">
          この型に該当する誤解パターンはまだありません。
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  count,
  hue,
  hueDim,
  Icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  hue: string;
  hueDim: string;
  Icon?: typeof AlertTriangle;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative flex items-center justify-between gap-2 overflow-hidden rounded-2xl px-3.5 py-3 text-left transition-transform active:scale-[0.98]"
      style={{
        background: active ? hueDim : "transparent",
        boxShadow: active
          ? `inset 0 0 0 1.5px ${hue}`
          : "inset 0 0 0 1px rgba(0,0,0,0.06)",
      }}
    >
      <span className="flex min-w-0 items-center gap-1.5">
        {Icon && (
          <Icon
            className="h-3.5 w-3.5 shrink-0"
            strokeWidth={2.4}
            style={{ color: hue }}
          />
        )}
        <span
          className="truncate text-[12.5px] font-semibold tracking-tight"
          style={{ color: active ? hue : undefined }}
        >
          {label}
        </span>
      </span>
      <span
        className="shrink-0 text-[11px] font-semibold num"
        style={{ color: active ? hue : "var(--muted-foreground, #8E8E93)" }}
      >
        {count}
      </span>
    </button>
  );
}

function ActiveArchetypeDescription({
  archetype,
}: {
  archetype: MisconceptionArchetype;
}) {
  const meta = ARCHETYPE_META[archetype];
  const Icon = meta.icon;
  return (
    <motion.div
      key={archetype}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl p-4"
      style={{
        background: meta.hueDim,
        boxShadow: `inset 0 0 0 1px ${meta.hue}40`,
      }}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
          style={{ background: meta.hue }}
        >
          <Icon className="h-4 w-4" strokeWidth={2.4} />
        </span>
        <div className="min-w-0">
          <div
            className="text-[10.5px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: meta.hue }}
          >
            {meta.shortLabel} 型
          </div>
          <div className="text-[14.5px] font-semibold tracking-tight">
            {meta.label}
          </div>
        </div>
      </div>
      <p className="mt-2 text-[13px] leading-[1.7] text-foreground/85">
        {meta.description}
      </p>
    </motion.div>
  );
}

function EnemyCard({
  item,
  rank,
  personalized,
}: {
  item: BrowserItem;
  rank: number;
  personalized: boolean;
}) {
  const archetypeMeta = item.archetype ? ARCHETYPE_META[item.archetype] : null;
  const rate = item.incorrectRate;
  const hue = personalized
    ? rate >= 0.5
      ? "#FF3B30"
      : rate >= 0.3
      ? "#FF9500"
      : "#FFCC00"
    : archetypeMeta?.hue ?? "#AF52DE";
  const hueDim = personalized
    ? rate >= 0.5
      ? "rgba(255,59,48,0.12)"
      : rate >= 0.3
      ? "rgba(255,149,0,0.12)"
      : "rgba(255,204,0,0.14)"
    : archetypeMeta?.hueDim ?? "rgba(175,82,222,0.14)";

  return (
    <Link
      href={`/misconceptions/${item.slug}`}
      className="group surface-card relative block overflow-hidden p-5 transition-transform active:scale-[0.99]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full opacity-[0.14] blur-2xl transition-opacity group-hover:opacity-[0.25]"
        style={{ background: hue }}
      />
      <div className="relative flex items-start justify-between">
        <span
          className="album-glyph text-[44px] leading-none"
          style={{ color: hue, opacity: 0.85 }}
        >
          #{rank}
        </span>
        <span
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: hueDim, color: hue }}
        >
          {personalized ? (
            <Flame className="h-4 w-4" strokeWidth={2.2} />
          ) : (
            <Skull className="h-4 w-4" strokeWidth={2.2} />
          )}
        </span>
      </div>
      <div className="relative mt-4">
        <div
          className="text-[10.5px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: hue }}
        >
          {personalized
            ? `誤答率 ${Math.round(rate * 100)}%`
            : `出題 ${item.usageCount}問`}
        </div>
        <div className="mt-0.5 text-[16px] font-semibold leading-tight tracking-tight">
          {item.title}
        </div>
        <p className="mt-1 line-clamp-2 text-[12px] text-muted-foreground text-pretty">
          {item.definition}
        </p>
        {archetypeMeta && (
          <div className="mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold"
            style={{ background: archetypeMeta.hueDim, color: archetypeMeta.hue }}
          >
            {archetypeMeta.shortLabel}
          </div>
        )}
      </div>
    </Link>
  );
}

function TrapCard({ item }: { item: BrowserItem }) {
  const archetypeMeta = item.archetype ? ARCHETYPE_META[item.archetype] : null;
  const hasHistory = item.attempted >= 2;
  const danger = hasHistory && item.incorrectRate >= 0.4;
  const hue = danger
    ? "#FF3B30"
    : hasHistory && item.incorrectRate >= 0.2
    ? "#FF9500"
    : archetypeMeta?.hue ?? "#8E8E93";
  const ArchetypeIcon = archetypeMeta?.icon ?? Target;

  return (
    <Link
      href={`/misconceptions/${item.slug}`}
      className="group flex items-start gap-3 rounded-2xl bg-card p-4 ring-1 ring-black/[0.04] shadow-surface transition-transform active:scale-[0.99] dark:ring-white/[0.06]"
    >
      <span
        className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{
          background:
            hue === "#8E8E93" ? "rgba(142,142,147,0.1)" : `${hue}1f`,
          color: hue,
        }}
      >
        {danger ? (
          <AlertTriangle className="h-4 w-4" strokeWidth={2.2} />
        ) : (
          <ArchetypeIcon className="h-4 w-4" strokeWidth={2.2} />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <div className="truncate text-[14.5px] font-semibold">
            {item.title}
          </div>
          <div className="shrink-0 text-[10.5px] text-muted-foreground num">
            {hasHistory ? (
              <span style={{ color: hue }}>
                誤答 {Math.round(item.incorrectRate * 100)}%
              </span>
            ) : (
              <>{item.usageCount}問</>
            )}
          </div>
        </div>
        <p className="mt-0.5 line-clamp-2 text-[12px] text-muted-foreground text-pretty">
          {item.definition}
        </p>
      </div>
      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

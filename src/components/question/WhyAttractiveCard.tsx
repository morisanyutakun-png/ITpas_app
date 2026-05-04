"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Sparkles, AlertTriangle, Eye } from "lucide-react";
import {
  ARCHETYPE_META,
  type MisconceptionArchetype,
} from "@/lib/misconceptionArchetypes";

/**
 * 「なぜこの選択肢が魅力的に見えたか」の解説カード — アプリのシグネチャー要素。
 *
 * 縦に 3 ステップで誤答の解剖を見せる。
 *  1) 罠の正体    — counterExample で「実際は何だったか」を端的に
 *  2) 魅力の正体  — whyAttractive (中核資産) で「なぜ選びたくなったか」
 *  3) 見破り方    — recoveryHint で「次に同じ罠を見たときの判別軸」
 *
 * archetype が分かるなら上部に「型バッジ」を表示し、図鑑への導線を兼ねる。
 */
export function WhyAttractiveCard({
  selectedLabel,
  whyAttractive,
  misconceptionSlug,
  misconceptionTitle,
  archetype,
  counterExample,
  recoveryHint,
}: {
  selectedLabel: string;
  whyAttractive: string;
  misconceptionSlug: string | null;
  misconceptionTitle?: string | null;
  archetype?: MisconceptionArchetype | null;
  counterExample?: string | null;
  recoveryHint?: string | null;
}) {
  const meta = archetype ? ARCHETYPE_META[archetype] : null;
  const ArchetypeIcon = meta?.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 22, delay: 0.1 }}
      className="relative overflow-hidden rounded-2xl p-5 shadow-ios ring-1 ring-ios-orange/15"
    >
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#FFF2E0] via-[#FFE4C4] to-[#FFD9B3] dark:from-[#3b2a15] dark:via-[#2d1f10] dark:to-[#25180b]" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-ios-orange/20 blur-2xl" />

      {/* Header: 選択肢ラベル + archetype バッジ */}
      <div className="relative flex items-start gap-3.5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-grad-sunset text-[17px] font-semibold text-white shadow-tint-orange">
          {selectedLabel}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ios-orange">
            <Sparkles className="h-3 w-3" strokeWidth={2.4} />
            なぜこの選択肢が魅力的に見えたか
          </div>
          {meta && ArchetypeIcon && misconceptionSlug && (
            <Link
              href={`/misconceptions?archetype=${meta.slug}`}
              className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-tight transition-transform active:scale-[0.97]"
              style={{ background: meta.hueDim, color: meta.hue }}
            >
              <ArchetypeIcon className="h-3 w-3" strokeWidth={2.6} />
              {meta.label} 型の罠
            </Link>
          )}
        </div>
      </div>

      {/* Step 1 — 罠の正体 (counterExample があれば優先) */}
      {counterExample && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="relative mt-4 rounded-xl bg-card/70 p-3.5 ring-1 ring-black/[0.04] backdrop-blur-sm dark:bg-background/40 dark:ring-white/[0.06]"
        >
          <StepHeader
            index={1}
            label="罠の正体"
            icon={AlertTriangle}
            tone="red"
          />
          <p className="mt-1.5 text-[14px] leading-[1.7] text-foreground">
            {counterExample}
          </p>
        </motion.div>
      )}

      {/* Step 2 — 魅力の正体 (whyAttractive: アプリの中核資産) */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24 }}
        className="relative mt-3 rounded-xl bg-card/70 p-3.5 ring-1 ring-black/[0.04] backdrop-blur-sm dark:bg-background/40 dark:ring-white/[0.06]"
      >
        <StepHeader
          index={counterExample ? 2 : 1}
          label="魅力の正体"
          icon={Sparkles}
          tone="orange"
        />
        <p className="mt-1.5 text-[14.5px] leading-[1.75] text-foreground">
          {whyAttractive}
        </p>
      </motion.div>

      {/* Step 3 — 次回の見破り方 (recoveryHint があれば) */}
      {recoveryHint && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative mt-3 rounded-xl bg-card/70 p-3.5 ring-1 ring-black/[0.04] backdrop-blur-sm dark:bg-background/40 dark:ring-white/[0.06]"
        >
          <StepHeader
            index={counterExample ? 3 : 2}
            label="次回の見破り方"
            icon={Eye}
            tone="green"
          />
          <p className="mt-1.5 text-[14px] leading-[1.7] text-foreground">
            {recoveryHint}
          </p>
        </motion.div>
      )}

      {/* 図鑑への導線 */}
      {misconceptionSlug && (
        <Link
          href={`/misconceptions/${misconceptionSlug}`}
          className="relative mt-4 flex items-center gap-3 rounded-xl bg-card/70 p-3 ring-1 ring-black/[0.04] backdrop-blur-sm transition-transform active:scale-[0.99] dark:bg-background/40 dark:ring-white/[0.06]"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ios-orange text-white shadow-tint-orange">
            <Sparkles className="h-4 w-4" strokeWidth={2.4} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              この罠の名前
            </div>
            <div className="truncate text-[14px] font-semibold">
              {misconceptionTitle ?? misconceptionSlug}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Link>
      )}
    </motion.div>
  );
}

function StepHeader({
  index,
  label,
  icon: Icon,
  tone,
}: {
  index: number;
  label: string;
  icon: typeof AlertTriangle;
  tone: "red" | "orange" | "green";
}) {
  const toneClass =
    tone === "red"
      ? "bg-ios-red/15 text-ios-red"
      : tone === "orange"
      ? "bg-ios-orange/15 text-ios-orange"
      : "bg-ios-green/15 text-ios-green";
  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold ${toneClass}`}
      >
        {index}
      </span>
      <span
        className={`flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.1em] ${
          tone === "red"
            ? "text-ios-red"
            : tone === "orange"
            ? "text-ios-orange"
            : "text-ios-green"
        }`}
      >
        <Icon className="h-3 w-3" strokeWidth={2.4} />
        {label}
      </span>
    </div>
  );
}

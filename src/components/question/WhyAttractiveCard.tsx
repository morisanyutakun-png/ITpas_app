"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Target, Sparkles } from "lucide-react";

/**
 * The "why-attractive" card — the app's signature moment.
 *
 * Sunset gradient + large chip with the selected label. The copy itself
 * carries the drama; the container holds warmth without shouting.
 */
export function WhyAttractiveCard({
  selectedLabel,
  whyAttractive,
  misconceptionSlug,
  misconceptionTitle,
}: {
  selectedLabel: string;
  whyAttractive: string;
  misconceptionSlug: string | null;
  misconceptionTitle?: string | null;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 22, delay: 0.1 }}
      className="relative overflow-hidden rounded-2xl p-5 shadow-ios ring-1 ring-ios-orange/15"
    >
      {/* Layered gradient background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#FFF2E0] via-[#FFE4C4] to-[#FFD9B3] dark:from-[#3b2a15] dark:via-[#2d1f10] dark:to-[#25180b]" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-ios-orange/20 blur-2xl" />

      <div className="relative flex items-start gap-3.5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-grad-sunset text-[17px] font-semibold text-white shadow-tint-orange">
          {selectedLabel}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ios-orange">
            <Sparkles className="h-3 w-3" strokeWidth={2.4} />
            なぜこの選択肢が魅力的に見えたか
          </div>
          <p className="mt-1.5 text-[15px] leading-[1.75] text-foreground">
            {whyAttractive}
          </p>
        </div>
      </div>

      {misconceptionSlug && (
        <Link
          href={`/misconceptions/${misconceptionSlug}`}
          className="relative mt-4 flex items-center gap-3 rounded-xl bg-card/70 p-3 ring-1 ring-black/[0.04] backdrop-blur-sm transition-transform active:scale-[0.99] dark:bg-background/40 dark:ring-white/[0.06]"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ios-orange text-white shadow-tint-orange">
            <Target className="h-4 w-4" strokeWidth={2.4} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              弱点の正体
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

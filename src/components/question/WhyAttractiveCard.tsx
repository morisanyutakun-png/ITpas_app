"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Target } from "lucide-react";

/**
 * The "why-attractive" card — the app's differentiation moment.
 *
 * Apple-style: calm tone on tan (systemYellow 10% tint) rather than the
 * previous full-gradient "ENEMY ENCOUNTER" skin. The content itself is
 * dramatic enough; the container shouldn't shout over it.
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 22, delay: 0.1 }}
      className="rounded-2xl bg-ios-yellow/10 p-5 shadow-ios-sm"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ios-orange text-[15px] font-semibold text-white">
          {selectedLabel}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-ios-orange">
            なぜこの選択肢が魅力的に見えたか
          </div>
          <p className="mt-1 text-[15px] leading-relaxed text-foreground">
            {whyAttractive}
          </p>
        </div>
      </div>

      {misconceptionSlug && (
        <Link
          href={`/misconceptions/${misconceptionSlug}`}
          className="mt-4 flex items-center gap-3 rounded-xl bg-background/60 p-3 active:opacity-80"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ios-orange/15 text-ios-orange">
            <Target className="h-4 w-4" strokeWidth={2.2} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
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

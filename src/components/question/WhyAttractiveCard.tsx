"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Skull, Zap } from "lucide-react";

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
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.15 }}
      className="relative overflow-hidden rounded-2xl border-2 border-amber-400 shadow-xl"
    >
      {/* Top stripe */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-5 py-2 flex items-center gap-2 text-white">
        <Skull className="h-4 w-4" />
        <span className="text-xs font-bold uppercase tracking-widest">
          ENEMY ENCOUNTER — あなたを引き寄せたワナ
        </span>
      </div>

      {/* Body */}
      <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 px-5 py-5 space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-2xl font-black text-white shadow-md">
            {selectedLabel}
          </div>
          <div className="flex-1 space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              なぜこの選択肢が魅力的に見えたか
            </div>
            <p className="text-sm md:text-base leading-relaxed text-slate-800">
              {whyAttractive}
            </p>
          </div>
        </div>

        {misconceptionSlug && (
          <Link
            href={`/misconceptions/${misconceptionSlug}`}
            className="group flex items-center justify-between gap-3 rounded-xl border-2 border-amber-300 bg-white/80 px-4 py-3 transition hover:border-amber-500 hover:bg-white hover:shadow-md"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <Zap className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                  弱点の正体
                </div>
                <div className="font-semibold text-slate-900 truncate">
                  {misconceptionTitle ?? misconceptionSlug}
                </div>
              </div>
            </div>
            <span className="shrink-0 text-xs text-amber-700 font-semibold group-hover:translate-x-0.5 transition-transform">
              詳細 →
            </span>
          </Link>
        )}
      </div>
    </motion.div>
  );
}

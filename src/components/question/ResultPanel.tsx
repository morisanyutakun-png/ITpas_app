"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, Footprints, Lightbulb, X } from "lucide-react";
import { Markdown } from "@/lib/markdown";
import { WhyAttractiveCard } from "./WhyAttractiveCard";
import { MisconceptionBadges } from "./MisconceptionBadges";
import { RelatedTopics } from "./RelatedTopics";
import { RelatedMaterials } from "./RelatedMaterials";

export type ResultPanelData = {
  isCorrect: boolean;
  selectedLabel: string;
  selectedChoice: {
    label: string;
    body: string;
    whyAttractive: string | null;
    misconceptionSlug: string | null;
  } | null;
  explanation: string;
  keyInsight?: string | null;
  commonMistakeFlow?: string | null;
  misconceptions: { slug: string; title: string }[];
  topics: { slug: string; title: string; summary: string }[];
  materials: { slug: string; title: string; body: string; role: string }[];
};

export function ResultPanel({
  data,
  nextHref,
}: {
  data: ResultPanelData;
  nextHref?: string;
}) {
  const selectedMisconception = data.misconceptions.find(
    (m) => m.slug === data.selectedChoice?.misconceptionSlug
  );

  return (
    <div className="space-y-4">
      {/* Verdict banner — gradient material with soft glow */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        className={`relative overflow-hidden rounded-2xl p-4 shadow-ios ring-1 ring-black/[0.04] dark:ring-white/[0.06] ${
          data.isCorrect
            ? "bg-gradient-to-br from-ios-green/10 via-card to-card"
            : "bg-gradient-to-br from-ios-red/10 via-card to-card"
        }`}
      >
        <div className="flex items-center gap-3.5">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 16, delay: 0.06 }}
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white ${
              data.isCorrect
                ? "bg-ios-green shadow-tint-green"
                : "bg-ios-red shadow-[0_10px_26px_rgba(255,59,48,0.32)]"
            }`}
          >
            {data.isCorrect ? (
              <Check className="h-6 w-6" strokeWidth={3} />
            ) : (
              <X className="h-6 w-6" strokeWidth={3} />
            )}
          </motion.div>
          <div className="min-w-0 flex-1">
            <div className="text-[18px] font-semibold tracking-tight">
              {data.isCorrect ? "正解" : "不正解"}
            </div>
            <div className="text-[13px] text-muted-foreground">
              {data.isCorrect
                ? "押さえた論点を関連資料で固めましょう"
                : "下の『魅力理由』が今日の収穫"}
            </div>
          </div>
        </div>
      </motion.div>

      {/* WhyAttractive */}
      {!data.isCorrect && data.selectedChoice?.whyAttractive && (
        <WhyAttractiveCard
          selectedLabel={data.selectedChoice.label}
          whyAttractive={data.selectedChoice.whyAttractive}
          misconceptionSlug={data.selectedChoice.misconceptionSlug ?? null}
          misconceptionTitle={selectedMisconception?.title}
        />
      )}

      {/* Explanation */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="surface-card p-6"
      >
        <div className="section-title">解説</div>
        <div className="mt-2 text-[15px] leading-[1.75]">
          <Markdown>{data.explanation}</Markdown>
        </div>
      </motion.div>

      {/* Key insight */}
      {data.keyInsight && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ios-green/10 via-card to-card p-5 shadow-surface ring-1 ring-ios-green/20"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ios-green text-white shadow-tint-green">
              <Lightbulb className="h-3.5 w-3.5" strokeWidth={2.4} />
            </span>
            <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ios-green">
              押さえるコツ
            </div>
          </div>
          <div className="mt-2 text-[15px] leading-[1.75]">
            <Markdown>{data.keyInsight}</Markdown>
          </div>
        </motion.div>
      )}

      {/* Common mistake flow */}
      {!data.isCorrect && data.commonMistakeFlow && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ios-red/8 via-card to-card p-5 shadow-surface ring-1 ring-ios-red/15"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ios-red text-white shadow-[0_8px_22px_rgba(255,59,48,0.28)]">
              <Footprints className="h-3.5 w-3.5" strokeWidth={2.4} />
            </span>
            <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ios-red">
              典型的な間違え方
            </div>
          </div>
          <div className="mt-2 text-[15px] leading-[1.75]">
            <Markdown>{data.commonMistakeFlow}</Markdown>
          </div>
        </motion.div>
      )}

      <MisconceptionBadges items={data.misconceptions} />

      <div className="grid gap-3 md:grid-cols-2">
        <RelatedTopics items={data.topics} />
        <RelatedMaterials items={data.materials} />
      </div>

      {/* Action row */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col gap-2 pt-2 md:flex-row"
      >
        {data.selectedChoice?.misconceptionSlug && !data.isCorrect && (
          <Link
            href={`/learn/session/new?mode=weakness&misconception=${data.selectedChoice.misconceptionSlug}&count=5`}
            className="pill-ghost h-12 px-5 text-[15px]"
          >
            この弱点を5問で潰す
          </Link>
        )}
        {nextHref && (
          <Link
            href={nextHref}
            className="pill-primary h-12 flex-1 gap-1.5 px-5 text-[15px] md:ml-auto md:flex-none"
          >
            次の問題へ
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </motion.div>
    </div>
  );
}

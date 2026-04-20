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
      {/* Verdict — compact iOS-style banner */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-ios-sm"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.05 }}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
            data.isCorrect ? "bg-ios-green" : "bg-ios-red"
          } text-white`}
        >
          {data.isCorrect ? (
            <Check className="h-5 w-5" strokeWidth={3} />
          ) : (
            <X className="h-5 w-5" strokeWidth={3} />
          )}
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="text-ios-headline font-semibold">
            {data.isCorrect ? "正解" : "不正解"}
          </div>
          <div className="text-[13px] text-muted-foreground">
            {data.isCorrect
              ? "押さえた論点を関連資料で固めましょう"
              : "下の『魅力理由』が今日の収穫"}
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
        className="rounded-2xl bg-card p-5 shadow-ios-sm"
      >
        <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          解説
        </div>
        <div className="mt-2 text-[15px] leading-relaxed">
          <Markdown>{data.explanation}</Markdown>
        </div>
      </motion.div>

      {/* Key insight */}
      {data.keyInsight && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-ios-green/5 p-5 shadow-ios-sm"
        >
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-ios-green" strokeWidth={2.2} />
            <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-ios-green">
              押さえるコツ
            </div>
          </div>
          <div className="mt-1.5 text-[15px] leading-relaxed">
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
          className="rounded-2xl bg-ios-red/5 p-5 shadow-ios-sm"
        >
          <div className="flex items-center gap-2">
            <Footprints className="h-4 w-4 text-ios-red" strokeWidth={2.2} />
            <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-ios-red">
              典型的な間違え方
            </div>
          </div>
          <div className="mt-1.5 text-[15px] leading-relaxed">
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
            className="inline-flex h-11 items-center justify-center rounded-full bg-muted px-5 text-[15px] font-semibold text-foreground active:opacity-80"
          >
            この弱点を5問で潰す
          </Link>
        )}
        {nextHref && (
          <Link
            href={nextHref}
            className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-5 text-[15px] font-semibold text-primary-foreground active:opacity-80 md:ml-auto md:flex-none"
          >
            次の問題へ
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </motion.div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, X, Sparkles, ArrowRight, Lightbulb, Footprints } from "lucide-react";
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
    <div className="space-y-5">
      {/* Verdict banner */}
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        className={`relative overflow-hidden rounded-2xl border-2 shadow-lg ${
          data.isCorrect ? "border-emerald-400" : "border-rose-400"
        }`}
      >
        <div
          className={`px-6 py-5 text-white bg-gradient-to-r ${
            data.isCorrect
              ? "from-emerald-500 to-teal-500"
              : "from-rose-500 to-pink-500"
          }`}
        >
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0, rotate: data.isCorrect ? -180 : 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 250, damping: 16, delay: 0.1 }}
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/30`}
            >
              {data.isCorrect ? (
                <Check className="h-8 w-8" strokeWidth={3.5} />
              ) : (
                <X className="h-8 w-8" strokeWidth={3.5} />
              )}
            </motion.div>
            <div className="flex-1">
              <div className="text-2xl font-black tracking-tight">
                {data.isCorrect ? "CORRECT!" : "MISS..."}
              </div>
              <div className="text-sm text-white/90">
                {data.isCorrect
                  ? "押さえた論点を関連資料で固めよう。"
                  : "下に出る "}
                {!data.isCorrect && (
                  <span className="font-bold underline decoration-white/50 underline-offset-2">
                    『なぜ魅力的に見えたか』
                  </span>
                )}
                {!data.isCorrect && " カードが今日の収穫。"}
              </div>
            </div>
            {data.isCorrect && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Sparkles className="h-7 w-7 text-yellow-300" />
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* WhyAttractive — only when wrong */}
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
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-2xl border bg-white p-5 shadow-sm"
      >
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          解説
        </div>
        <Markdown>{data.explanation}</Markdown>
      </motion.div>

      {/* Key insight — the "decisive shortcut" to remember */}
      {data.keyInsight && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white">
              <Lightbulb className="h-4 w-4" strokeWidth={2.5} />
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              押さえるコツ
            </div>
          </div>
          <Markdown className="text-emerald-950">{data.keyInsight}</Markdown>
        </motion.div>
      )}

      {/* Common mistake flow — only show on miss */}
      {!data.isCorrect && data.commonMistakeFlow && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl border-2 border-rose-200 bg-rose-50/60 p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500 text-white">
              <Footprints className="h-4 w-4" strokeWidth={2.5} />
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-rose-800">
              典型的な間違え方の流れ
            </div>
          </div>
          <Markdown className="text-rose-950">{data.commonMistakeFlow}</Markdown>
        </motion.div>
      )}

      <MisconceptionBadges items={data.misconceptions} />

      <div className="grid gap-4 md:grid-cols-2">
        <RelatedTopics items={data.topics} />
        <RelatedMaterials items={data.materials} />
      </div>

      {/* Action row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap gap-3 pt-2"
      >
        {data.selectedChoice?.misconceptionSlug && !data.isCorrect && (
          <Link
            href={`/learn/session/new?mode=weakness&misconception=${data.selectedChoice.misconceptionSlug}&count=5`}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-amber-400 bg-amber-50 px-5 py-3 font-semibold text-amber-900 shadow-sm transition hover:bg-amber-100 hover:shadow"
          >
            この弱点を5問で潰す
          </Link>
        )}
        {nextHref && (
          <Link
            href={nextHref}
            className="ml-auto inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-bold text-white shadow-lg transition hover:bg-slate-800 hover:shadow-xl"
          >
            次の問題へ
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </motion.div>
    </div>
  );
}

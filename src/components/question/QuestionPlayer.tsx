"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { ChoiceList, type ChoiceVM } from "./ChoiceList";
import {
  ResultPanel,
  type ResultPanelData,
  type ResultPanelMisconception,
} from "./ResultPanel";
import { recordAttemptAction } from "@/server/actions/attempts";
import { UpgradeModal } from "@/components/UpgradeModal";

export type QuestionPlayerProps = {
  questionId: string;
  choices: (ChoiceVM & {
    whyAttractive: string | null;
    misconceptionSlug: string | null;
  })[];
  explanation: string;
  keyInsight?: string | null;
  commonMistakeFlow?: string | null;
  misconceptions: ResultPanelMisconception[];
  topics: { slug: string; title: string; summary: string }[];
  materials: { slug: string; title: string; body: string; role: string }[];
  nextHref?: string;
  sessionId?: string;
};

export function QuestionPlayer(props: QuestionPlayerProps) {
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [startedAt] = useState<number>(Date.now());
  const [isPending, startTransition] = useTransition();
  const [paywall, setPaywall] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);

  const onSubmit = () => {
    if (!selectedLabel) return;
    const isCorrect =
      props.choices.find((c) => c.label === selectedLabel)?.isCorrect ?? false;
    const durationMs = Date.now() - startedAt;
    startTransition(async () => {
      const res = await recordAttemptAction({
        questionId: props.questionId,
        selectedChoiceLabel: selectedLabel,
        result: isCorrect ? "correct" : "incorrect",
        durationMs,
        sessionId: props.sessionId,
      });
      if (!res.ok && res.reason === "daily_limit") {
        setPaywall(true);
        return;
      }
      if (res.ok) setRemaining(res.remaining);
      setRevealed(true);
    });
  };

  return (
    <div className="space-y-4">
      <UpgradeModal
        open={paywall}
        onClose={() => setPaywall(false)}
        reason="daily_limit"
      />

      {remaining !== null && remaining <= 3 && !paywall && (
        <div className="flex items-center gap-2 rounded-2xl bg-ios-yellow/10 px-4 py-3 text-[13px] text-ios-orange shadow-ios-sm">
          <span className="flex-1">
            今日の無料枠は残り <strong>{remaining}問</strong>
          </span>
          <a
            href="/pricing?reason=daily_limit"
            className="shrink-0 rounded-full bg-ios-orange px-3 py-1 text-[12px] font-semibold text-white"
          >
            Proへ
          </a>
        </div>
      )}

      <ChoiceList
        choices={props.choices}
        selectedLabel={selectedLabel}
        revealed={revealed}
        onSelect={setSelectedLabel}
      />

      <AnimatePresence mode="wait">
        {!revealed && (
          <motion.div
            key="submit"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="sticky bottom-[calc(env(safe-area-inset-bottom)+64px)] md:static md:bottom-auto"
          >
            <button
              disabled={!selectedLabel || isPending}
              onClick={onSubmit}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-[16px] font-semibold text-primary-foreground shadow-ios-lg transition active:opacity-80 disabled:opacity-40 disabled:shadow-none"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  記録中…
                </>
              ) : (
                "回答する"
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {revealed && (
        <ResultPanel
          data={buildResultData(props, selectedLabel!)}
          nextHref={props.nextHref}
        />
      )}
    </div>
  );
}

function buildResultData(
  props: QuestionPlayerProps,
  selectedLabel: string
): ResultPanelData {
  const selected = props.choices.find((c) => c.label === selectedLabel) ?? null;
  const correct = props.choices.find((c) => c.isCorrect) ?? null;
  return {
    isCorrect: selected?.isCorrect ?? false,
    selectedLabel,
    selectedChoice: selected
      ? {
          label: selected.label,
          body: selected.body,
          whyAttractive: selected.whyAttractive,
          misconceptionSlug: selected.misconceptionSlug,
        }
      : null,
    correctChoice: correct
      ? { label: correct.label, body: correct.body }
      : null,
    explanation: props.explanation,
    keyInsight: props.keyInsight ?? null,
    commonMistakeFlow: props.commonMistakeFlow ?? null,
    misconceptions: props.misconceptions,
    topics: props.topics,
    materials: props.materials,
  };
}

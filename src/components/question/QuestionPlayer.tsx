"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChoiceList, type ChoiceVM } from "./ChoiceList";
import { ResultPanel, type ResultPanelData } from "./ResultPanel";
import { recordAttemptAction } from "@/server/actions/attempts";
import { Loader2 } from "lucide-react";

export type QuestionPlayerProps = {
  questionId: string;
  choices: (ChoiceVM & {
    whyAttractive: string | null;
    misconceptionSlug: string | null;
  })[];
  explanation: string;
  keyInsight?: string | null;
  commonMistakeFlow?: string | null;
  misconceptions: { slug: string; title: string }[];
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

  const onSubmit = () => {
    if (!selectedLabel) return;
    const isCorrect =
      props.choices.find((c) => c.label === selectedLabel)?.isCorrect ?? false;
    const durationMs = Date.now() - startedAt;
    setRevealed(true);
    startTransition(async () => {
      await recordAttemptAction({
        questionId: props.questionId,
        selectedChoiceLabel: selectedLabel,
        result: isCorrect ? "correct" : "incorrect",
        durationMs,
        sessionId: props.sessionId,
      });
    });
  };

  return (
    <div className="space-y-5">
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
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center justify-between gap-3 rounded-2xl border bg-slate-50 px-5 py-4"
          >
            <div className="text-sm text-slate-600">
              {selectedLabel ? (
                <>
                  選択中:{" "}
                  <span className="font-bold text-slate-900">
                    {selectedLabel}
                  </span>
                </>
              ) : (
                "選択肢をタップして選んでください"
              )}
            </div>
            <button
              disabled={!selectedLabel || isPending}
              onClick={onSubmit}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-bold text-white shadow-lg transition enabled:hover:bg-slate-800 enabled:hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  記録中
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
    explanation: props.explanation,
    keyInsight: props.keyInsight ?? null,
    commonMistakeFlow: props.commonMistakeFlow ?? null,
    misconceptions: props.misconceptions,
    topics: props.topics,
    materials: props.materials,
  };
}

"use client";

import { useState, useTransition } from "react";
import { ChoiceList, type ChoiceVM } from "./ChoiceList";
import { ResultPanel, type ResultPanelData } from "./ResultPanel";
import { Button } from "@/components/ui/button";
import { recordAttemptAction } from "@/server/actions/attempts";

export type QuestionPlayerProps = {
  questionId: string;
  choices: (ChoiceVM & {
    whyAttractive: string | null;
    misconceptionSlug: string | null;
  })[];
  explanation: string;
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

  if (!revealed) {
    return (
      <div className="space-y-4">
        <ChoiceList
          choices={props.choices}
          selectedLabel={selectedLabel}
          revealed={false}
          onSelect={setSelectedLabel}
        />
        <div className="flex justify-end">
          <Button disabled={!selectedLabel || isPending} onClick={onSubmit}>
            回答する
          </Button>
        </div>
      </div>
    );
  }

  const selected = props.choices.find((c) => c.label === selectedLabel) ?? null;
  const data: ResultPanelData = {
    isCorrect: selected?.isCorrect ?? false,
    selectedLabel: selectedLabel!,
    selectedChoice: selected
      ? {
          label: selected.label,
          body: selected.body,
          whyAttractive: selected.whyAttractive,
          misconceptionSlug: selected.misconceptionSlug,
        }
      : null,
    explanation: props.explanation,
    misconceptions: props.misconceptions,
    topics: props.topics,
    materials: props.materials,
  };

  return (
    <div className="space-y-4">
      <ChoiceList
        choices={props.choices}
        selectedLabel={selectedLabel}
        revealed
        onSelect={() => {}}
      />
      <ResultPanel data={data} nextHref={props.nextHref} />
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type ChoiceVM = {
  label: string;
  body: string;
  isCorrect: boolean;
};

export function ChoiceList({
  choices,
  selectedLabel,
  revealed,
  onSelect,
}: {
  choices: ChoiceVM[];
  selectedLabel: string | null;
  revealed: boolean;
  onSelect: (label: string) => void;
}) {
  return (
    <div className="grid gap-2">
      {choices.map((c) => {
        const isSelected = selectedLabel === c.label;
        const showCorrect = revealed && c.isCorrect;
        const showWrong = revealed && isSelected && !c.isCorrect;

        return (
          <Button
            key={c.label}
            type="button"
            variant="outline"
            disabled={revealed}
            onClick={() => onSelect(c.label)}
            className={cn(
              "h-auto justify-start whitespace-normal text-left py-3 px-4",
              isSelected && !revealed && "ring-2 ring-primary",
              showCorrect && "bg-emerald-50 border-emerald-500 text-emerald-900 hover:bg-emerald-50",
              showWrong && "bg-rose-50 border-rose-500 text-rose-900 hover:bg-rose-50"
            )}
          >
            <span className="mr-3 font-bold shrink-0">{c.label}.</span>
            <span className="flex-1">{c.body}</span>
            {showCorrect && <span className="ml-2 text-emerald-700">✓</span>}
            {showWrong && <span className="ml-2 text-rose-700">✗</span>}
          </Button>
        );
      })}
    </div>
  );
}

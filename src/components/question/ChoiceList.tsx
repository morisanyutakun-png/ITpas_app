"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ChoiceVM = {
  label: string;
  body: string;
  isCorrect: boolean;
};

/**
 * Apple-style choice list.
 *
 * Neutral cards by default; state is expressed with a single tint (primary
 * blue for selected, system green/red on reveal). Large tap targets with
 * subtle haptic-like scale animation. Label tile is a small circle, not a
 * big colored panel — keeps the row clean and scannable.
 */
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
    <div className="space-y-2">
      {choices.map((c, i) => {
        const isSelected = selectedLabel === c.label;
        const showCorrect = revealed && c.isCorrect;
        const showWrong = revealed && isSelected && !c.isCorrect;
        const dimmed = revealed && !c.isCorrect && !isSelected;

        return (
          <motion.button
            key={c.label}
            type="button"
            disabled={revealed}
            onClick={() => onSelect(c.label)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: dimmed ? 0.4 : 1, y: 0 }}
            transition={{ duration: 0.18, delay: i * 0.03 }}
            whileTap={!revealed ? { scale: 0.985 } : undefined}
            className={cn(
              "flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left shadow-ios-sm transition-colors",
              !revealed && !isSelected && "active:bg-muted",
              !revealed && isSelected && "ring-2 ring-primary",
              showCorrect && "ring-2 ring-ios-green bg-ios-green/5",
              showWrong && "ring-2 ring-ios-red bg-ios-red/5"
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[15px] font-semibold",
                !revealed && !isSelected && "bg-muted text-foreground",
                !revealed && isSelected && "bg-primary text-primary-foreground",
                showCorrect && "bg-ios-green text-white",
                showWrong && "bg-ios-red text-white",
                dimmed && "bg-muted text-muted-foreground"
              )}
            >
              {c.label}
            </span>

            <span className="flex-1 text-[15px] leading-relaxed text-foreground">
              {c.body}
            </span>

            {showCorrect && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 320, damping: 18 }}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ios-green text-white"
              >
                <Check className="h-4 w-4" strokeWidth={3} />
              </motion.div>
            )}
            {showWrong && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 320, damping: 18 }}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ios-red text-white"
              >
                <X className="h-4 w-4" strokeWidth={3} />
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

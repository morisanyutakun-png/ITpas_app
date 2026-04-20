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
 * Neutral cards, state earned by a single tint. Selected adopts a subtle
 * primary ring; revealed states fade non-choices and animate the verdict
 * chip with a spring. Each row has a hairline ring for crispness.
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
    <div className="space-y-2.5">
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
            transition={{ duration: 0.22, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
            whileTap={!revealed ? { scale: 0.985 } : undefined}
            className={cn(
              "group relative flex w-full items-center gap-3.5 rounded-2xl bg-card p-4 text-left ring-1 ring-black/[0.04] shadow-surface transition-[background-color,box-shadow,ring] dark:ring-white/[0.06]",
              !revealed && !isSelected && "hover:bg-muted/40 active:bg-muted/70",
              !revealed && isSelected && "ring-2 ring-primary bg-primary/[0.04] shadow-tint-blue",
              showCorrect && "ring-2 ring-ios-green bg-ios-green/[0.06]",
              showWrong && "ring-2 ring-ios-red bg-ios-red/[0.06]"
            )}
          >
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[15px] font-semibold transition-colors",
                !revealed && !isSelected && "bg-muted text-foreground",
                !revealed && isSelected && "bg-primary text-primary-foreground shadow-tint-blue",
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
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 18 }}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ios-green text-white shadow-tint-green"
              >
                <Check className="h-4 w-4" strokeWidth={3} />
              </motion.div>
            )}
            {showWrong && (
              <motion.div
                initial={{ scale: 0, rotate: 20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 18 }}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ios-red text-white shadow-[0_8px_22px_rgba(255,59,48,0.32)]"
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

"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { choiceTheme } from "@/lib/design";

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
    <div className="grid gap-3">
      {choices.map((c, i) => {
        const theme = choiceTheme[c.label] ?? choiceTheme["ア"];
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
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: dimmed ? 0.4 : 1, y: 0 }}
            transition={{ duration: 0.18, delay: i * 0.04 }}
            whileHover={!revealed ? { scale: 1.01, y: -1 } : undefined}
            whileTap={!revealed ? { scale: 0.99 } : undefined}
            className={cn(
              "group relative flex w-full items-stretch gap-0 overflow-hidden rounded-xl border-2 text-left transition-shadow",
              !revealed && "shadow-sm hover:shadow-md",
              !revealed && (isSelected ? theme.selected : theme.tile),
              showCorrect && "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400 shadow-lg",
              showWrong && "bg-rose-50 border-rose-500 ring-2 ring-rose-400 shadow-lg",
              dimmed && "bg-slate-50 border-slate-200"
            )}
          >
            {/* Big colored label tile */}
            <div
              className={cn(
                "flex w-14 shrink-0 items-center justify-center text-2xl font-black",
                theme.label,
                showCorrect && "bg-emerald-500",
                showWrong && "bg-rose-500",
                dimmed && "bg-slate-300"
              )}
            >
              {c.label}
            </div>

            <div className="flex flex-1 items-center justify-between gap-3 px-4 py-4">
              <span className="text-sm md:text-base leading-relaxed">{c.body}</span>
              {showCorrect && (
                <motion.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white"
                >
                  <Check className="h-5 w-5" strokeWidth={3} />
                </motion.div>
              )}
              {showWrong && (
                <motion.div
                  initial={{ scale: 0, rotate: 90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white"
                >
                  <X className="h-5 w-5" strokeWidth={3} />
                </motion.div>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

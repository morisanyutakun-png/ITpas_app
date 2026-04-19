import { pickFormat, pickMajor } from "@/lib/design";
import { Markdown } from "@/lib/markdown";
import { Sparkles } from "lucide-react";

const ORIGIN_LABEL: Record<string, { tag: string; full: string; tone: string }> = {
  ipa_inspired: {
    tag: "オリジナル",
    full: "IPA出題範囲を元に作成したオリジナル問題",
    tone: "bg-violet-100 text-violet-800 border-violet-200",
  },
  ipa_actual: {
    tag: "IPA過去問",
    full: "IPA ITパスポート試験 過去問題",
    tone: "bg-slate-900 text-white border-slate-900",
  },
  original: {
    tag: "オリジナル",
    full: "完全オリジナル問題",
    tone: "bg-violet-100 text-violet-800 border-violet-200",
  },
};

export function QuestionCard({
  examYear,
  examSeason,
  questionNumber,
  majorCategory,
  formatType,
  stem,
  originType = "ipa_inspired",
}: {
  examYear: number;
  examSeason: "spring" | "autumn" | "annual";
  questionNumber: number;
  majorCategory: string;
  formatType: string;
  stem: string;
  originType?: string;
}) {
  const major = pickMajor(majorCategory);
  const fmt = pickFormat(formatType);
  const FmtIcon = fmt.icon;
  const MajorIcon = major.icon;
  const origin = ORIGIN_LABEL[originType] ?? ORIGIN_LABEL.ipa_inspired;
  const seasonLabel =
    examSeason === "spring" ? "春" : examSeason === "autumn" ? "秋" : "";

  // For ipa_inspired: show "R{year}範囲 #{n}" instead of "R{year} 第{n}問"
  // to avoid implying it's the literal Nth question of the exam.
  const isInspired = originType !== "ipa_actual";
  const refLabel = isInspired
    ? `R${examYear}${seasonLabel}範囲 #${questionNumber}`
    : `R${examYear}${seasonLabel} 第${questionNumber}問`;

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className={`h-1.5 w-full bg-gradient-to-r ${major.gradient}`} />
      <div className="p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${origin.tone}`}
          >
            {originType === "ipa_inspired" && <Sparkles className="h-3 w-3" />}
            {origin.tag}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${major.chip}`}
          >
            <MajorIcon className="h-3.5 w-3.5" />
            {major.label}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
            <FmtIcon className={`h-3.5 w-3.5 ${fmt.color}`} />
            {fmt.label}
          </span>
          <span className="ml-auto rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
            {refLabel}
          </span>
        </div>
        <div className="text-base md:text-lg leading-relaxed text-slate-900">
          <Markdown>{stem}</Markdown>
        </div>
      </div>
    </div>
  );
}

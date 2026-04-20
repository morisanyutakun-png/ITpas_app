import { pickFormat, pickMajor } from "@/lib/design";
import { Markdown } from "@/lib/markdown";

const ORIGIN_LABEL: Record<string, { tag: string; tone: string }> = {
  ipa_inspired: {
    tag: "オリジナル",
    tone: "bg-ios-purple/10 text-ios-purple",
  },
  ipa_actual: {
    tag: "過去問",
    tone: "bg-foreground text-background",
  },
  original: {
    tag: "オリジナル",
    tone: "bg-ios-purple/10 text-ios-purple",
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
  const origin = ORIGIN_LABEL[originType] ?? ORIGIN_LABEL.ipa_inspired;
  const seasonLabel =
    examSeason === "spring" ? "春" : examSeason === "autumn" ? "秋" : "";

  const isInspired = originType !== "ipa_actual";
  const refLabel = isInspired
    ? `R${examYear}${seasonLabel}範囲 #${questionNumber}`
    : `R${examYear}${seasonLabel} 問${questionNumber}`;

  return (
    <div className="rounded-2xl bg-card p-5 shadow-ios-sm">
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium">
        <span
          className={`rounded-full px-2 py-0.5 ${origin.tone}`}
        >
          {origin.tag}
        </span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
          {major.label}
        </span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
          {fmt.label}
        </span>
        <span className="ml-auto text-muted-foreground tabular-nums">
          {refLabel}
        </span>
      </div>
      <div className="mt-4 text-[16px] leading-[1.65] text-foreground">
        <Markdown>{stem}</Markdown>
      </div>
    </div>
  );
}

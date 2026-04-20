import { pickFormat, pickMajor } from "@/lib/design";
import { Markdown } from "@/lib/markdown";

const ORIGIN_LABEL: Record<string, { tag: string; tone: string }> = {
  ipa_inspired: {
    tag: "オリジナル",
    tone: "bg-ios-purple/12 text-ios-purple",
  },
  ipa_actual: {
    tag: "過去問",
    tone: "bg-foreground text-background",
  },
  original: {
    tag: "オリジナル",
    tone: "bg-ios-purple/12 text-ios-purple",
  },
};

const MAJOR_GRAD: Record<string, string> = {
  strategy: "bg-grad-purple",
  management: "bg-grad-ocean",
  technology: "bg-grad-green",
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

  const majorGrad = MAJOR_GRAD[majorCategory] ?? "bg-grad-green";

  return (
    <div className="surface-card p-6">
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
        <span className={`rounded-full px-2.5 py-0.5 ${origin.tone}`}>
          {origin.tag}
        </span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-white ${majorGrad}`}
          aria-label={major.label}
        >
          {major.label}
        </span>
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-muted-foreground">
          {fmt.label}
        </span>
        <span className="num ml-auto text-[11px] font-medium text-muted-foreground">
          {refLabel}
        </span>
      </div>
      <div className="mt-5 text-[16.5px] leading-[1.7] text-foreground">
        <Markdown>{stem}</Markdown>
      </div>
    </div>
  );
}

import { pickFormat, pickMajor } from "@/lib/design";
import { Markdown } from "@/lib/markdown";

export function QuestionCard({
  examYear,
  examSeason,
  questionNumber,
  majorCategory,
  formatType,
  stem,
}: {
  examYear: number;
  examSeason: "spring" | "autumn" | "annual";
  questionNumber: number;
  majorCategory: string;
  formatType: string;
  stem: string;
}) {
  const major = pickMajor(majorCategory);
  const fmt = pickFormat(formatType);
  const FmtIcon = fmt.icon;
  const MajorIcon = major.icon;
  const seasonLabel =
    examSeason === "spring" ? "春" : examSeason === "autumn" ? "秋" : "";

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className={`h-1.5 w-full bg-gradient-to-r ${major.gradient}`} />
      <div className="p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${major.chip}`}
          >
            <MajorIcon className="h-3.5 w-3.5" />
            {major.label}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700`}
          >
            <FmtIcon className={`h-3.5 w-3.5 ${fmt.color}`} />
            {fmt.label}
          </span>
          <span className="ml-auto rounded-md bg-slate-900 px-2 py-0.5 text-xs font-bold text-white">
            R{examYear}
            {seasonLabel} 第{questionNumber}問
          </span>
        </div>
        <div className="text-base md:text-lg leading-relaxed">
          <Markdown>{stem}</Markdown>
        </div>
      </div>
    </div>
  );
}

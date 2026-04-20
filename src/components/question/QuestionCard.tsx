import { pickFormat, pickMajor } from "@/lib/design";
import { Markdown } from "@/lib/markdown";

const ORIGIN_LABEL: Record<string, { tag: string; hue: string; hueDim: string }> = {
  ipa_inspired: {
    tag: "オリジナル",
    hue: "#AF52DE",
    hueDim: "rgba(175,82,222,0.14)",
  },
  ipa_actual: {
    tag: "過去問",
    hue: "#0A84FF",
    hueDim: "rgba(10,132,255,0.14)",
  },
  original: {
    tag: "オリジナル",
    hue: "#AF52DE",
    hueDim: "rgba(175,82,222,0.14)",
  },
};

const MAJOR_META: Record<
  string,
  { hue: string; hueDim: string; label: string }
> = {
  strategy: {
    hue: "#FF375F",
    hueDim: "rgba(255,55,95,0.14)",
    label: "STRATEGY",
  },
  management: {
    hue: "#FF9500",
    hueDim: "rgba(255,149,0,0.14)",
    label: "MANAGEMENT",
  },
  technology: {
    hue: "#0A84FF",
    hueDim: "rgba(10,132,255,0.14)",
    label: "TECHNOLOGY",
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
  const meta = MAJOR_META[majorCategory] ?? MAJOR_META.technology;
  const seasonLabel =
    examSeason === "spring" ? "春" : examSeason === "autumn" ? "秋" : "";

  const isActual = originType === "ipa_actual";
  const refLabel = isActual
    ? `R${examYear}${seasonLabel} 問${questionNumber}`
    : `R${examYear}${seasonLabel}範囲 #${questionNumber}`;

  return (
    <section className="surface-card relative overflow-hidden">
      {/* Top color bar matching the major category */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ background: meta.hue }}
      />

      {/* Decorative "Q.NN" album glyph — magazine feel */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-6 select-none"
        style={{ color: meta.hueDim }}
      >
        <span className="album-glyph text-[150px] leading-none">
          {questionNumber}
        </span>
      </div>

      <div className="relative p-6 sm:p-7">
        {/* Editorial meta row */}
        <div className="flex flex-wrap items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.14em]">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
            style={{ background: origin.hueDim, color: origin.hue }}
          >
            {origin.tag}
          </span>
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
            style={{ background: meta.hueDim, color: meta.hue }}
          >
            {major.label}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
            {fmt.label}
          </span>
        </div>

        {/* Reference line — year + question number */}
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <div className="min-w-0">
            <div
              className="text-[10px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: meta.hue }}
            >
              {isActual ? "IPA Past Paper" : "IPA-Inspired"}
            </div>
            <div
              className="album-glyph mt-0.5 text-[32px] leading-none sm:text-[36px]"
              style={{ color: meta.hue }}
            >
              Q.{String(questionNumber).padStart(2, "0")}
            </div>
            <div className="num mt-1 text-[11px] font-medium text-muted-foreground">
              {refLabel}
            </div>
          </div>
        </div>

        {/* Hairline divider */}
        <div className="my-5 h-px w-full bg-border" />

        {/* Stem body — large, readable */}
        <div className="text-[16.5px] leading-[1.8] text-foreground">
          <Markdown>{stem}</Markdown>
        </div>
      </div>
    </section>
  );
}

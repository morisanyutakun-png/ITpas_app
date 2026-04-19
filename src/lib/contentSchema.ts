import { z } from "zod";

export const majorCategoryZ = z.enum(["strategy", "management", "technology"]);
export const examSeasonZ = z.enum(["spring", "autumn", "annual"]);
export const formatTypeZ = z.enum([
  "definition",
  "comparison",
  "case",
  "table_read",
  "calculation",
  "pseudo_lang",
  "spreadsheet",
  "security_case",
  "biz_analysis",
  "law_ip",
  "network_basics",
  "db_basics",
]);
export const originTypeZ = z.enum(["ipa_actual", "ipa_inspired", "original"]);
export const trapTypeZ = z.enum([
  "similar_term",
  "scope_overgeneral",
  "negation_miss",
  "abbrev_mix",
  "order_swap",
  "edge_case_miss",
  "none",
]);
export const materialTypeZ = z.enum([
  "term_compare",
  "diagram",
  "pseudo_lang_helper",
  "spreadsheet_helper",
  "concept_note",
  "cheatsheet",
]);

export const choiceLabelZ = z.enum(["ア", "イ", "ウ", "エ"]);

export const questionFileZ = z.object({
  externalKey: z.string().min(1),
  examYear: z.number().int(),
  examSeason: examSeasonZ,
  questionNumber: z.number().int().positive(),
  majorCategory: majorCategoryZ,
  formatType: formatTypeZ,
  trapType: trapTypeZ.default("none"),
  stem: z.string().min(1),
  choices: z
    .array(
      z.object({
        label: choiceLabelZ,
        body: z.string().min(1),
        isCorrect: z.boolean(),
        whyAttractive: z.string().nullable(),
        misconceptionSlug: z.string().nullable(),
      })
    )
    .length(4)
    .superRefine((arr, ctx) => {
      const correct = arr.filter((c) => c.isCorrect);
      if (correct.length !== 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Exactly one choice must be isCorrect=true (got ${correct.length})`,
        });
      }
      for (const c of arr) {
        if (!c.isCorrect && (!c.whyAttractive || c.whyAttractive.trim() === "")) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Choice ${c.label}: whyAttractive is required for incorrect choices`,
          });
        }
      }
    }),
  explanation: z.string().min(1),
  topicSlugs: z
    .array(z.object({ slug: z.string().min(1), weight: z.number().default(1.0) }))
    .default([]),
  misconceptionSlugs: z
    .array(z.object({ slug: z.string().min(1), weight: z.number().default(1.0) }))
    .default([]),
  materialSlugs: z
    .array(
      z.object({
        slug: z.string().min(1),
        role: z.enum(["primary", "compare", "helper"]).default("helper"),
      })
    )
    .default([]),
  originType: originTypeZ.default("ipa_inspired"),
  sourceNote: z.string().nullable().default(null),
  sourceFilePath: z.string().nullable().default(null),
  sourcePageNumber: z.number().int().nullable().default(null),
});

export const topicFileZ = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  majorCategory: majorCategoryZ,
  minorTopic: z.string().min(1),
  summary: z.string().default(""),
  body: z.string().default(""),
});

export const misconceptionFileZ = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  definition: z.string().min(1),
  typicalExample: z.string().default(""),
  counterExample: z.string().default(""),
  recoveryHint: z.string().default(""),
});

export const materialFrontmatterZ = z.object({
  slug: z.string().min(1),
  type: materialTypeZ,
  title: z.string().min(1),
  sourceFilePath: z.string().nullable().optional(),
  sourcePageNumber: z.number().int().nullable().optional(),
});

export type QuestionFile = z.infer<typeof questionFileZ>;
export type TopicFile = z.infer<typeof topicFileZ>;
export type MisconceptionFile = z.infer<typeof misconceptionFileZ>;
export type MaterialFrontmatter = z.infer<typeof materialFrontmatterZ>;

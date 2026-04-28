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
  keyInsight: z.string().nullable().default(null),
  commonMistakeFlow: z.string().nullable().default(null),
  originType: originTypeZ.default("ipa_inspired"),
  sourceNote: z.string().nullable().default(null),
  modifiedNote: z.string().nullable().default(null),
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

// ── Study lessons (input) ────────────────────────────────────────────────
//
// "Input" content shown at /learn/study/<slug>. Lessons render a structured
// figure plus 3-6 short bullets and 1-3 pitfalls — the goal is "60 seconds
// to read, then 5 questions to test". Authors do NOT write arbitrary HTML
// or SVG; figures must use one of the typed primitives below so the
// rendering stays consistent and readable.

const layeredFigureZ = z.object({
  kind: z.literal("layered"),
  // Bottom-to-top stack. Each layer has a label and 1-3 example items.
  // Layer order in the array is bottom layer first; renderer reverses
  // it so the visual reads top-down (matching textbook OSI diagrams).
  layers: z
    .array(
      z.object({
        label: z.string().min(1),
        items: z.array(z.string()).default([]),
        accent: z.enum(["primary", "warm", "cool", "neutral"]).default("neutral"),
      })
    )
    .min(2),
  // Optional caption rendered below the figure.
  caption: z.string().optional(),
});

const compareFigureZ = z.object({
  kind: z.literal("compare"),
  left: z.object({
    title: z.string().min(1),
    accent: z.enum(["primary", "warm", "cool", "neutral"]).default("primary"),
    points: z.array(z.string()).min(1),
  }),
  right: z.object({
    title: z.string().min(1),
    accent: z.enum(["primary", "warm", "cool", "neutral"]).default("warm"),
    points: z.array(z.string()).min(1),
  }),
  caption: z.string().optional(),
});

const flowFigureZ = z.object({
  kind: z.literal("flow"),
  // Horizontal arrow chain. Keep to ≤5 steps so it doesn't wrap awkwardly.
  steps: z
    .array(
      z.object({
        label: z.string().min(1),
        body: z.string().optional(),
      })
    )
    .min(2)
    .max(5),
  caption: z.string().optional(),
});

const quadrantFigureZ = z.object({
  kind: z.literal("quadrant"),
  axes: z.object({
    x: z.string().min(1),
    y: z.string().min(1),
  }),
  // Order: top-left, top-right, bottom-left, bottom-right.
  cells: z
    .array(
      z.object({
        title: z.string().min(1),
        body: z.string().optional(),
      })
    )
    .length(4),
  caption: z.string().optional(),
});

export const studyFigureZ = z.discriminatedUnion("kind", [
  layeredFigureZ,
  compareFigureZ,
  flowFigureZ,
  quadrantFigureZ,
]);

export const studyLessonZ = z.object({
  slug: z.string().min(1), // matches a topic slug
  title: z.string().min(1),
  // 1 sentence "what this is + why it shows up". Anchors the lesson.
  hook: z.string().min(1),
  figure: studyFigureZ,
  // 3-6 short bullets. `term` is the takeaway label; `body` is one line.
  keyPoints: z
    .array(
      z.object({
        term: z.string().min(1),
        body: z.string().min(1),
      })
    )
    .min(2)
    .max(7),
  // 0-3 pitfalls — what the test usually swaps to trap you.
  pitfalls: z.array(z.string()).max(3).default([]),
  // Default 5; overridable for short topics.
  questionCount: z.number().int().min(1).max(20).default(5),
  estimatedSeconds: z.number().int().min(20).max(600).default(60),
});

export type QuestionFile = z.infer<typeof questionFileZ>;
export type TopicFile = z.infer<typeof topicFileZ>;
export type MisconceptionFile = z.infer<typeof misconceptionFileZ>;
export type MaterialFrontmatter = z.infer<typeof materialFrontmatterZ>;
export type StudyLesson = z.infer<typeof studyLessonZ>;
export type StudyFigure = z.infer<typeof studyFigureZ>;

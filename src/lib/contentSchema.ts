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
        accent: z
        .enum(["primary", "warm", "cool", "neutral", "accent", "danger", "success"])
        .default("neutral"),
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
    accent: z
      .enum(["primary", "warm", "cool", "neutral", "accent", "danger", "success"])
      .default("primary"),
    points: z.array(z.string()).min(1),
  }),
  right: z.object({
    title: z.string().min(1),
    accent: z
      .enum(["primary", "warm", "cool", "neutral", "accent", "danger", "success"])
      .default("warm"),
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

// Numbered step-list figure — for procedures and "what happens in order"
// explanations. Renders as numbered cards stacked vertically. Better than
// `flow` for beginners because the numbers are unambiguous and the layout
// stays compact on mobile.
const stepListFigureZ = z.object({
  kind: z.literal("step-list"),
  steps: z
    .array(
      z.object({
        title: z.string().min(1),
        body: z.string().min(1),
      })
    )
    .min(2)
    .max(8),
  caption: z.string().optional(),
});

// Tree / hierarchy figure — for taxonomies (e.g. malware kinds, network
// topology, organizational structure). One root → 2-5 children, each
// optionally with sub-points.
const treeFigureZ = z.object({
  kind: z.literal("tree"),
  root: z.object({
    title: z.string().min(1),
    body: z.string().optional(),
  }),
  children: z
    .array(
      z.object({
        title: z.string().min(1),
        body: z.string().optional(),
        accent: z
        .enum(["primary", "warm", "cool", "neutral", "accent", "danger", "success"])
        .default("neutral"),
        items: z.array(z.string()).default([]),
      })
    )
    .min(2)
    .max(6),
  caption: z.string().optional(),
});

// Labeled diagram — a single concept with surrounding annotations. Use
// for "anatomy" diagrams where one central thing has 3-5 callouts pointing
// at parts of it. Renders as a centerpiece card surrounded by labels.
const labeledDiagramFigureZ = z.object({
  kind: z.literal("labeled-diagram"),
  centerpiece: z.object({
    title: z.string().min(1),
    body: z.string().optional(),
    accent: z
      .enum(["primary", "warm", "cool", "neutral", "accent", "danger", "success"])
      .default("primary"),
  }),
  labels: z
    .array(
      z.object({
        label: z.string().min(1),
        body: z.string().min(1),
      })
    )
    .min(2)
    .max(6),
  caption: z.string().optional(),
});

// Topology diagram — explicit positioned nodes connected by lines. Used
// for network diagrams, authentication flows, request/response paths.
// Positions are 0..100 percentages so the renderer can lay them out on a
// 2D grid regardless of canvas size.
const topologyFigureZ = z.object({
  kind: z.literal("topology"),
  caption: z.string().optional(),
  nodes: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        sublabel: z.string().optional(),
        x: z.number().min(0).max(100),
        y: z.number().min(0).max(100),
        accent: z
          .enum(["primary", "warm", "cool", "neutral", "accent", "danger", "success"])
          .default("neutral"),
        shape: z.enum(["box", "circle", "cloud", "device"]).default("box"),
      })
    )
    .min(2)
    .max(8),
  edges: z
    .array(
      z.object({
        from: z.string().min(1),
        to: z.string().min(1),
        label: z.string().optional(),
        style: z.enum(["solid", "dashed", "arrow", "bidir"]).default("solid"),
      })
    )
    .max(12),
});

// Matrix — N rows × M columns. The first column lists row labels (e.g.
// "速度", "信頼性"), and each remaining column is one entity to compare.
// Cells can be marked correct/wrong/neutral so visual hierarchy emerges.
const matrixFigureZ = z.object({
  kind: z.literal("matrix"),
  caption: z.string().optional(),
  columns: z
    .array(
      z.object({
        title: z.string().min(1),
        accent: z
          .enum(["primary", "warm", "cool", "neutral", "accent", "danger", "success"])
          .default("neutral"),
      })
    )
    .min(2)
    .max(4),
  rows: z
    .array(
      z.object({
        label: z.string().min(1),
        cells: z
          .array(
            z.object({
              text: z.string().min(1),
              tone: z.enum(["positive", "negative", "neutral"]).default("neutral"),
            })
          )
          .min(2)
          .max(4),
      })
    )
    .min(2)
    .max(8),
});

// Timeline — phases with horizontal bars. Used for development phases,
// PERT-style critical paths, lifecycle phases.
const timelineFigureZ = z.object({
  kind: z.literal("timeline"),
  caption: z.string().optional(),
  phases: z
    .array(
      z.object({
        label: z.string().min(1),
        body: z.string().optional(),
        // Width as a relative weight; renderer normalizes.
        weight: z.number().positive().default(1),
        accent: z
          .enum(["primary", "warm", "cool", "neutral", "accent", "danger", "success"])
          .default("neutral"),
      })
    )
    .min(2)
    .max(8),
});

// Proportion bar — show how a whole is divided. Useful for capacity ratios
// (RAID), market share, time allocation.
const proportionBarFigureZ = z.object({
  kind: z.literal("proportion-bar"),
  caption: z.string().optional(),
  total: z.number().positive().default(100),
  segments: z
    .array(
      z.object({
        label: z.string().min(1),
        value: z.number().positive(),
        accent: z
          .enum(["primary", "warm", "cool", "neutral", "accent", "danger", "success"])
          .default("neutral"),
      })
    )
    .min(2)
    .max(8),
});

export const studyFigureZ = z.discriminatedUnion("kind", [
  layeredFigureZ,
  compareFigureZ,
  flowFigureZ,
  quadrantFigureZ,
  stepListFigureZ,
  treeFigureZ,
  labeledDiagramFigureZ,
  topologyFigureZ,
  matrixFigureZ,
  timelineFigureZ,
  proportionBarFigureZ,
]);

// A callout — short, accented note inline with the prose. Three voices:
//   • insight  : the lesson's takeaway in one breath (used sparingly)
//   • caution  : a typical exam trap or terminology slip
//   • aside    : context-only background that would otherwise distract
const calloutZ = z.object({
  kind: z.enum(["insight", "caution", "aside"]),
  title: z.string().optional(),
  body: z.string().min(1),
});

// "アナロジー" block — a tiny everyday-life metaphor that prepares the
// reader before a hard term. Drawn from psychology: anchoring an unfamiliar
// concept to something familiar nearly halves the cognitive load.
const analogyZ = z.object({
  // Short label — e.g. "たとえると", "身近な例で言うと"
  label: z.string().default("たとえると"),
  body: z.string().min(1),
});

// Mini self-check at the end of a section — one short ◯×/択一 question.
// Different from the formal `examples` array: this is "the paragraph you
// just read" rather than exam-format.
const miniQuizZ = z.object({
  // 1-line yes/no or short-answer question.
  question: z.string().min(1),
  // The expected answer ("はい" / "いいえ" / "ルータ" / etc.).
  answer: z.string().min(1),
  // Optional 1-line explanation.
  hint: z.string().optional(),
});

// One body section. The renderer enforces "every section has a figure"
// editorially via authoring guidance — the schema keeps `figure` optional
// to allow the rare narrative-only opener.
const sectionZ = z.object({
  // Section heading shown as "Step N · 見出し".
  heading: z.string().min(1),
  // Optional 1-sentence summary shown right under the heading. Helps
  // beginners grasp the section's point before reading the prose.
  summary: z.string().optional(),
  // Optional analogy box rendered at the very top of the section, before
  // any paragraphs.
  analogy: analogyZ.optional(),
  // 2-8 paragraphs. Bold via `**word**`; inline code via `\`word\``.
  paragraphs: z.array(z.string().min(1)).min(1).max(12),
  // Optional inline figure rendered after the prose.
  figure: studyFigureZ.optional(),
  // Optional callouts rendered after the figure.
  callouts: z.array(calloutZ).max(3).default([]),
  // Optional mini self-check at the end of the section.
  miniQuiz: miniQuizZ.optional(),
});

const exampleZ = z.object({
  // The full question stem — write it like an exam question, not a riddle.
  question: z.string().min(1),
  // The single correct answer + a 1-2 sentence reason.
  answer: z.string().min(1),
  reasoning: z.string().min(1),
});

export const studyLessonZ = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  // 1-2 sentences placed under the title — sets the stakes of the lesson.
  hook: z.string().min(1),
  // Optional editorial subheader ("dek") — magazine-style 1-line summary
  // that runs *above* the title in small caps.
  dek: z.string().optional(),
  // Optional accent override. When omitted the renderer falls back to the
  // major color, but lessons can pick a sharper sub-accent (e.g. emerald
  // for crypto under the technology hue) so similar topics don't look
  // identical in the catalog.
  accent: z
    .enum(["primary", "warm", "cool", "neutral", "accent", "danger", "success"])
    .optional(),
  // The hero figure rendered at the top of the lesson, before any prose.
  // Sections may also carry their own inline figures.
  figure: studyFigureZ,
  // Long-form body. 2-6 sections, each a small chapter.
  sections: z.array(sectionZ).min(1).max(8),
  // 3-7 takeaways at the end ("Reader's digest"). Each is one short line.
  takeaways: z
    .array(
      z.object({
        term: z.string().min(1),
        body: z.string().min(1),
      })
    )
    .min(2)
    .max(8),
  // 0-4 worked examples — exam-style Q+A with reasoning. These show up as
  // a quiet "練習問題" subsection before the related-question handoff.
  examples: z.array(exampleZ).max(4).default([]),
  // Reading time in minutes (renderer prefers minutes for long-form).
  readingMinutes: z.number().int().min(1).max(20).default(5),
  // Number of related exam questions to hand off to at the end.
  questionCount: z.number().int().min(1).max(20).default(5),
});

export type QuestionFile = z.infer<typeof questionFileZ>;
export type TopicFile = z.infer<typeof topicFileZ>;
export type MisconceptionFile = z.infer<typeof misconceptionFileZ>;
export type MaterialFrontmatter = z.infer<typeof materialFrontmatterZ>;
export type StudyLesson = z.infer<typeof studyLessonZ>;
export type StudyFigure = z.infer<typeof studyFigureZ>;

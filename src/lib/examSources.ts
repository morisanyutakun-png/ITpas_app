import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";

export const examSourceZ = z.object({
  slug: z.string().min(1),
  examYear: z.number().int(),
  examSeason: z.enum(["spring", "autumn", "annual"]),
  label: z.string().min(1),
  shortLabel: z.string().min(1),
  issuer: z.string().min(1),
  sourceUrl: z.string().url(),
  sourceFilePath: z.string().nullable().optional(),
  extractedTextPath: z.string().nullable().optional(),
  extractedPagesDir: z.string().nullable().optional(),
  totalQuestions: z.number().int().positive(),
  notes: z.string().default(""),
});
export type ExamSource = z.infer<typeof examSourceZ>;

export const mockExamTemplateZ = z.object({
  slug: z.string().min(1),
  label: z.string().min(1),
  description: z.string().default(""),
  count: z.number().int().positive(),
  durationMin: z.number().int().positive(),
  /**
   * `past_exam` = 公開過去問からそのまま出題 (originType: ipa_actual).
   * `mock` = 本サイトが作成したオリジナル模試問題 (originType: ipa_inspired/original).
   */
  sourceType: z.enum(["past_exam", "mock"]).default("mock"),
  filter: z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("all") }),
    z.object({
      kind: z.literal("year"),
      examYear: z.number().int(),
      examSeason: z.enum(["spring", "autumn", "annual"]).optional(),
    }),
    z.object({
      kind: z.literal("category"),
      majorCategory: z.enum(["strategy", "management", "technology"]),
    }),
  ]),
  badge: z.string().default(""),
  tier: z.enum(["free", "pro", "premium"]).default("pro"),
});
export type MockExamTemplate = z.infer<typeof mockExamTemplateZ>;

let _sourcesCache: ExamSource[] | null = null;
let _templatesCache: MockExamTemplate[] | null = null;

export function getExamSources(): ExamSource[] {
  if (_sourcesCache) return _sourcesCache;
  const p = join(process.cwd(), "content", "structured", "exam_sources.json");
  const raw = JSON.parse(readFileSync(p, "utf8"));
  _sourcesCache = z.array(examSourceZ).parse(raw);
  return _sourcesCache;
}

export function getExamSourceByYear(
  examYear: number,
  examSeason?: "spring" | "autumn" | "annual"
): ExamSource | null {
  const sources = getExamSources();
  return (
    sources.find(
      (s) =>
        s.examYear === examYear &&
        (examSeason === undefined || s.examSeason === examSeason)
    ) ?? null
  );
}

export function getMockExamTemplates(): MockExamTemplate[] {
  if (_templatesCache) return _templatesCache;
  const p = join(
    process.cwd(),
    "content",
    "structured",
    "mock_exam_templates.json"
  );
  const raw = JSON.parse(readFileSync(p, "utf8"));
  _templatesCache = z.array(mockExamTemplateZ).parse(raw);
  return _templatesCache;
}

export function getMockExamTemplate(slug: string): MockExamTemplate | null {
  return getMockExamTemplates().find((t) => t.slug === slug) ?? null;
}

export function formatExamCitation(
  source: ExamSource,
  questionNumber?: number
): string {
  const base = `出典：${source.label}`;
  return questionNumber != null ? `${base} 問${questionNumber}` : base;
}

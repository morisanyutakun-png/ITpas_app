import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { questions } from "@/db/schema";
import { getExamSources, type ExamSource } from "@/lib/examSources";

export type PastExamSummary = ExamSource & {
  /** How many questions from this exam are actually imported into the DB. */
  importedCount: number;
  /** Percentage of the exam that is fully structured and available in the app. */
  coveragePct: number;
  /** Distribution over major categories, for the UI bar. */
  categoryCounts: {
    strategy: number;
    management: number;
    technology: number;
  };
};

export async function listPastExams(filters?: {
  minYear?: number | null;
}): Promise<PastExamSummary[]> {
  const sources = getExamSources();
  // Past-exam archive shows ONLY verbatim IPA questions (originType=ipa_actual).
  // Inspired/original questions (e.g. r05_qXX, mock_vol1_qXX) are *mock*
  // content — they live under /learn/mock-exam, not the past-exam archive.
  const rows = await db
    .select({
      examYear: questions.examYear,
      examSeason: questions.examSeason,
      majorCategory: questions.majorCategory,
      c: sql<number>`count(*)::int`,
    })
    .from(questions)
    .where(
      and(
        eq(questions.originType, "ipa_actual"),
        filters?.minYear != null
          ? gte(questions.examYear, filters.minYear)
          : undefined
      )
    )
    .groupBy(questions.examYear, questions.examSeason, questions.majorCategory);

  const byKey = new Map<
    string,
    { total: number; cats: Record<string, number> }
  >();
  for (const r of rows) {
    const key = `${r.examYear}:${r.examSeason}`;
    const entry = byKey.get(key) ?? { total: 0, cats: {} };
    entry.total += Number(r.c);
    entry.cats[r.majorCategory] =
      (entry.cats[r.majorCategory] ?? 0) + Number(r.c);
    byKey.set(key, entry);
  }

  return sources
    .filter(
      (s) => filters?.minYear == null || s.examYear >= (filters.minYear ?? 0)
    )
    .map((s) => {
      const entry = byKey.get(`${s.examYear}:${s.examSeason}`) ?? {
        total: 0,
        cats: {},
      };
      return {
        ...s,
        importedCount: entry.total,
        coveragePct:
          s.totalQuestions > 0
            ? Math.round((entry.total / s.totalQuestions) * 100)
            : 0,
        categoryCounts: {
          strategy: entry.cats.strategy ?? 0,
          management: entry.cats.management ?? 0,
          technology: entry.cats.technology ?? 0,
        },
      };
    })
    .sort(
      (a, b) =>
        b.examYear - a.examYear ||
        (a.examSeason === "autumn" ? -1 : 1) -
          (b.examSeason === "autumn" ? -1 : 1)
    );
}

export async function getExamQuestionStats(
  examYear: number,
  examSeason: "spring" | "autumn" | "annual"
) {
  const rows = await db
    .select({
      majorCategory: questions.majorCategory,
      formatType: questions.formatType,
      c: sql<number>`count(*)::int`,
    })
    .from(questions)
    .where(
      and(
        eq(questions.examYear, examYear),
        eq(questions.examSeason, examSeason)
      )
    )
    .groupBy(questions.majorCategory, questions.formatType);
  return rows;
}

export async function getTotalAvailableCount(
  minYear?: number | null
): Promise<number> {
  const row = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(questions)
    .where(minYear != null ? gte(questions.examYear, minYear) : undefined)
    .orderBy(desc(questions.examYear));
  return Number(row[0]?.c ?? 0);
}

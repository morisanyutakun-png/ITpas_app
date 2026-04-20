import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { misconceptions, questionMisconceptions, questions } from "@/db/schema";

export async function listMisconceptions() {
  return db.select().from(misconceptions).orderBy(asc(misconceptions.title));
}

export type MisconceptionWithStats = {
  slug: string;
  title: string;
  definition: string;
  usageCount: number;
  attempted: number;
  incorrectRate: number;
};

/**
 * List misconceptions with usage counts and — optionally — per-user incorrect
 * rate. Used by the editorial index to surface "biggest enemies" first.
 */
export async function listMisconceptionsWithStats(
  userId?: string | null
): Promise<MisconceptionWithStats[]> {
  const countRows = await db.execute(sql`
    SELECT m.slug AS slug, m.title AS title, m.definition AS definition,
      COUNT(qm.question_id)::int AS "usageCount"
    FROM misconceptions m
    LEFT JOIN question_misconceptions qm ON qm.misconception_id = m.id
    GROUP BY m.id
    ORDER BY m.title ASC
  `);

  const base: MisconceptionWithStats[] = countRows.rows.map((r) => {
    const o = r as Record<string, unknown>;
    return {
      slug: String(o.slug),
      title: String(o.title),
      definition: String(o.definition),
      usageCount: Number(o.usageCount ?? 0),
      attempted: 0,
      incorrectRate: 0,
    };
  });

  if (!userId) return base;

  const rateRows = await db.execute(sql`
    SELECT m.slug AS slug,
      COUNT(*)::int AS attempted,
      (SUM(CASE WHEN a.result = 'incorrect' THEN 1 ELSE 0 END)::float
        / NULLIF(COUNT(*), 0)::float) AS rate
    FROM attempts a
    JOIN question_misconceptions qm ON qm.question_id = a.question_id
    JOIN misconceptions m ON m.id = qm.misconception_id
    WHERE a.user_id = ${userId} AND a.result IN ('correct', 'incorrect')
    GROUP BY m.slug
  `);
  const bySlug = new Map<string, { attempted: number; rate: number }>();
  for (const r of rateRows.rows as Array<Record<string, unknown>>) {
    bySlug.set(String(r.slug), {
      attempted: Number(r.attempted ?? 0),
      rate: Number(r.rate ?? 0),
    });
  }
  return base.map((b) => {
    const s = bySlug.get(b.slug);
    return {
      ...b,
      attempted: s?.attempted ?? 0,
      incorrectRate: s?.rate ?? 0,
    };
  });
}

export async function getMisconception(slug: string) {
  const m = await db.query.misconceptions.findFirst({
    where: eq(misconceptions.slug, slug),
  });
  if (!m) return null;

  const qs = await db
    .select({
      id: questions.id,
      externalKey: questions.externalKey,
      examYear: questions.examYear,
      questionNumber: questions.questionNumber,
      stem: questions.stem,
    })
    .from(questionMisconceptions)
    .innerJoin(questions, eq(questions.id, questionMisconceptions.questionId))
    .where(eq(questionMisconceptions.misconceptionId, m.id))
    .orderBy(asc(questions.examYear), asc(questions.questionNumber));

  return { misconception: m, questions: qs };
}

/** Per-user incorrect rate across the questions that reference this misconception. */
export async function getMisconceptionProgress(
  slug: string,
  userId: string | null
): Promise<{ attempted: number; incorrect: number; rate: number }> {
  if (!userId) return { attempted: 0, incorrect: 0, rate: 0 };
  const rows = await db.execute(sql`
    SELECT
      COUNT(*)::int AS attempted,
      SUM(CASE WHEN a.result = 'incorrect' THEN 1 ELSE 0 END)::int AS incorrect
    FROM attempts a
    JOIN question_misconceptions qm ON qm.question_id = a.question_id
    JOIN misconceptions m ON m.id = qm.misconception_id
    WHERE m.slug = ${slug} AND a.user_id = ${userId}
      AND a.result IN ('correct', 'incorrect')
  `);
  const r = (rows.rows[0] ?? {}) as { attempted?: number; incorrect?: number };
  const attempted = Number(r.attempted ?? 0);
  const incorrect = Number(r.incorrect ?? 0);
  return {
    attempted,
    incorrect,
    rate: attempted > 0 ? incorrect / attempted : 0,
  };
}

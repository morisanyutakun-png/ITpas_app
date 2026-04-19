import { sql } from "drizzle-orm";
import { db } from "@/db/client";

export type MisconceptionProgress = {
  slug: string;
  title: string;
  attempted: number;
  correct: number;
  incorrect: number;
  incorrectRate: number;
};

export async function getProgressByMisconception(
  userId: string
): Promise<MisconceptionProgress[]> {
  const rows = await db.execute(sql`
    SELECT
      m.slug AS slug,
      m.title AS title,
      COUNT(*)::int AS attempted,
      SUM(CASE WHEN a.result = 'correct' THEN 1 ELSE 0 END)::int AS correct,
      SUM(CASE WHEN a.result = 'incorrect' THEN 1 ELSE 0 END)::int AS incorrect
    FROM attempts a
    JOIN question_misconceptions qm ON qm.question_id = a.question_id
    JOIN misconceptions m ON m.id = qm.misconception_id
    WHERE a.user_id = ${userId} AND a.result IN ('correct', 'incorrect')
    GROUP BY m.slug, m.title
    ORDER BY (
      SUM(CASE WHEN a.result = 'incorrect' THEN 1 ELSE 0 END)::float /
      NULLIF(COUNT(*), 0)
    ) DESC NULLS LAST
  `);

  return (rows.rows as Array<Record<string, unknown>>).map((r) => {
    const attempted = Number(r.attempted ?? 0);
    const correct = Number(r.correct ?? 0);
    const incorrect = Number(r.incorrect ?? 0);
    return {
      slug: String(r.slug),
      title: String(r.title),
      attempted,
      correct,
      incorrect,
      incorrectRate: attempted ? incorrect / attempted : 0,
    };
  });
}

export type TopicProgress = {
  slug: string;
  title: string;
  majorCategory: string;
  attempted: number;
  correct: number;
  incorrect: number;
  correctRate: number;
};

export async function getProgressByTopic(userId: string): Promise<TopicProgress[]> {
  const rows = await db.execute(sql`
    SELECT
      t.slug AS slug,
      t.title AS title,
      t.major_category AS major_category,
      COUNT(*)::int AS attempted,
      SUM(CASE WHEN a.result = 'correct' THEN 1 ELSE 0 END)::int AS correct,
      SUM(CASE WHEN a.result = 'incorrect' THEN 1 ELSE 0 END)::int AS incorrect
    FROM attempts a
    JOIN question_topics qt ON qt.question_id = a.question_id
    JOIN topics t ON t.id = qt.topic_id
    WHERE a.user_id = ${userId} AND a.result IN ('correct', 'incorrect')
    GROUP BY t.slug, t.title, t.major_category
    ORDER BY t.major_category, t.title
  `);

  return (rows.rows as Array<Record<string, unknown>>).map((r) => {
    const attempted = Number(r.attempted ?? 0);
    const correct = Number(r.correct ?? 0);
    const incorrect = Number(r.incorrect ?? 0);
    return {
      slug: String(r.slug),
      title: String(r.title),
      majorCategory: String(r.major_category),
      attempted,
      correct,
      incorrect,
      correctRate: attempted ? correct / attempted : 0,
    };
  });
}

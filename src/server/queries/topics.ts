import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { materials, questionTopics, questions, topicMaterials, topics } from "@/db/schema";

export async function listTopics() {
  return db
    .select()
    .from(topics)
    .orderBy(asc(topics.majorCategory), asc(topics.minorTopic), asc(topics.title));
}

/** Per-user progress for a single topic (by slug). Returns 0s if signed-out. */
export async function getTopicProgress(
  slug: string,
  userId: string | null
): Promise<{ attempted: number; correct: number; rate: number }> {
  if (!userId) return { attempted: 0, correct: 0, rate: 0 };
  const rows = await db.execute(sql`
    SELECT
      COUNT(*)::int AS attempted,
      SUM(CASE WHEN a.result = 'correct' THEN 1 ELSE 0 END)::int AS correct
    FROM attempts a
    JOIN question_topics qt ON qt.question_id = a.question_id
    JOIN topics t ON t.id = qt.topic_id
    WHERE t.slug = ${slug} AND a.user_id = ${userId}
      AND a.result IN ('correct', 'incorrect')
  `);
  const r = (rows.rows[0] ?? {}) as { attempted?: number; correct?: number };
  const attempted = Number(r.attempted ?? 0);
  const correct = Number(r.correct ?? 0);
  return {
    attempted,
    correct,
    rate: attempted > 0 ? correct / attempted : 0,
  };
}

export async function getTopic(slug: string) {
  const t = await db.query.topics.findFirst({ where: eq(topics.slug, slug) });
  if (!t) return null;

  const mats = await db
    .select({
      slug: materials.slug,
      title: materials.title,
      type: materials.type,
    })
    .from(topicMaterials)
    .innerJoin(materials, eq(materials.id, topicMaterials.materialId))
    .where(eq(topicMaterials.topicId, t.id));

  const qs = await db
    .select({
      id: questions.id,
      externalKey: questions.externalKey,
      examYear: questions.examYear,
      questionNumber: questions.questionNumber,
      stem: questions.stem,
    })
    .from(questionTopics)
    .innerJoin(questions, eq(questions.id, questionTopics.questionId))
    .where(eq(questionTopics.topicId, t.id))
    .orderBy(asc(questions.examYear), asc(questions.questionNumber));

  return { topic: t, materials: mats, questions: qs };
}

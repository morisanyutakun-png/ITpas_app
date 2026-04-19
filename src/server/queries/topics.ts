import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { materials, questionTopics, questions, topicMaterials, topics } from "@/db/schema";

export async function listTopics() {
  return db
    .select()
    .from(topics)
    .orderBy(asc(topics.majorCategory), asc(topics.minorTopic), asc(topics.title));
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

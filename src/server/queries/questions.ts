import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import {
  choices,
  materials,
  misconceptions,
  questionMaterials,
  questionMisconceptions,
  questionTopics,
  questions,
  topics,
} from "@/db/schema";

export async function listQuestions(filters?: {
  examYear?: number;
  majorCategory?: "strategy" | "management" | "technology";
  formatType?: string;
  topicSlug?: string;
  misconceptionSlug?: string;
  originType?: "ipa_actual" | "ipa_inspired" | "original";
}) {
  const where = [] as ReturnType<typeof eq>[];
  if (filters?.examYear !== undefined) {
    where.push(eq(questions.examYear, filters.examYear));
  }
  if (filters?.majorCategory) {
    where.push(eq(questions.majorCategory, filters.majorCategory));
  }
  if (filters?.originType) {
    where.push(eq(questions.originType, filters.originType));
  }
  // formatType requires enum-typed value; skip strict check at MVP

  if (filters?.topicSlug) {
    const t = await db.query.topics.findFirst({
      where: eq(topics.slug, filters.topicSlug),
    });
    if (!t) return [];
    const rows = await db
      .select({ qid: questionTopics.questionId })
      .from(questionTopics)
      .where(eq(questionTopics.topicId, t.id));
    const ids = rows.map((r) => r.qid);
    if (ids.length === 0) return [];
    where.push(inArray(questions.id, ids));
  }
  if (filters?.misconceptionSlug) {
    const m = await db.query.misconceptions.findFirst({
      where: eq(misconceptions.slug, filters.misconceptionSlug),
    });
    if (!m) return [];
    const rows = await db
      .select({ qid: questionMisconceptions.questionId })
      .from(questionMisconceptions)
      .where(eq(questionMisconceptions.misconceptionId, m.id));
    const ids = rows.map((r) => r.qid);
    if (ids.length === 0) return [];
    where.push(inArray(questions.id, ids));
  }

  const rows = await db
    .select({
      id: questions.id,
      externalKey: questions.externalKey,
      examYear: questions.examYear,
      examSeason: questions.examSeason,
      questionNumber: questions.questionNumber,
      majorCategory: questions.majorCategory,
      formatType: questions.formatType,
      stem: questions.stem,
      originType: questions.originType,
    })
    .from(questions)
    .where(where.length ? and(...where) : undefined)
    .orderBy(asc(questions.examYear), asc(questions.questionNumber))
    .limit(200);

  return rows;
}

export async function getQuestionFull(id: string) {
  const q = await db.query.questions.findFirst({
    where: eq(questions.id, id),
  });
  if (!q) return null;

  const cs = await db
    .select()
    .from(choices)
    .where(eq(choices.questionId, q.id))
    .orderBy(asc(choices.label));

  const qts = await db
    .select({
      slug: topics.slug,
      title: topics.title,
      summary: topics.summary,
    })
    .from(questionTopics)
    .innerJoin(topics, eq(topics.id, questionTopics.topicId))
    .where(eq(questionTopics.questionId, q.id));

  const qms = await db
    .select({
      slug: misconceptions.slug,
      title: misconceptions.title,
    })
    .from(questionMisconceptions)
    .innerJoin(
      misconceptions,
      eq(misconceptions.id, questionMisconceptions.misconceptionId)
    )
    .where(eq(questionMisconceptions.questionId, q.id));

  const qmats = await db
    .select({
      slug: materials.slug,
      title: materials.title,
      body: materials.body,
      role: questionMaterials.role,
    })
    .from(questionMaterials)
    .innerJoin(materials, eq(materials.id, questionMaterials.materialId))
    .where(eq(questionMaterials.questionId, q.id));

  return { question: q, choices: cs, topics: qts, misconceptions: qms, materials: qmats };
}

export async function getQuestionByExternalKey(externalKey: string) {
  return db.query.questions.findFirst({
    where: eq(questions.externalKey, externalKey),
  });
}

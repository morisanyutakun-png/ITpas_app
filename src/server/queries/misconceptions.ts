import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { misconceptions, questionMisconceptions, questions } from "@/db/schema";

export async function listMisconceptions() {
  return db.select().from(misconceptions).orderBy(asc(misconceptions.title));
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

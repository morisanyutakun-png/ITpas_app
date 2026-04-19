import { config as loadDotenv } from "dotenv";
loadDotenv({ path: ".env.local" });

import { eq, sql } from "drizzle-orm";
import { db } from "../src/db/client";
import {
  choices,
  materials,
  misconceptions,
  questionMaterials,
  questionMisconceptions,
  questionTopics,
  questions,
  topics,
} from "../src/db/schema";
import {
  loadMaterials,
  loadMisconceptions,
  loadQuestions,
  loadTopics,
} from "./loadStructured";

async function upsertTopics() {
  const items = loadTopics();
  for (const t of items) {
    await db
      .insert(topics)
      .values({
        slug: t.slug,
        title: t.title,
        majorCategory: t.majorCategory,
        minorTopic: t.minorTopic,
        summary: t.summary,
        body: t.body,
      })
      .onConflictDoUpdate({
        target: topics.slug,
        set: {
          title: t.title,
          majorCategory: t.majorCategory,
          minorTopic: t.minorTopic,
          summary: t.summary,
          body: t.body,
          updatedAt: sql`now()`,
        },
      });
  }
  console.log(`  topics:         ${items.length} upserted`);
}

async function upsertMisconceptions() {
  const items = loadMisconceptions();
  for (const m of items) {
    await db
      .insert(misconceptions)
      .values({
        slug: m.slug,
        title: m.title,
        definition: m.definition,
        typicalExample: m.typicalExample,
        counterExample: m.counterExample,
        recoveryHint: m.recoveryHint,
      })
      .onConflictDoUpdate({
        target: misconceptions.slug,
        set: {
          title: m.title,
          definition: m.definition,
          typicalExample: m.typicalExample,
          counterExample: m.counterExample,
          recoveryHint: m.recoveryHint,
          updatedAt: sql`now()`,
        },
      });
  }
  console.log(`  misconceptions: ${items.length} upserted`);
}

async function upsertMaterials() {
  const items = loadMaterials();
  for (const mat of items) {
    await db
      .insert(materials)
      .values({
        slug: mat.slug,
        type: mat.type,
        title: mat.title,
        body: mat.body,
        sourceFilePath: mat.sourceFilePath ?? null,
        sourcePageNumber: mat.sourcePageNumber ?? null,
      })
      .onConflictDoUpdate({
        target: materials.slug,
        set: {
          type: mat.type,
          title: mat.title,
          body: mat.body,
          sourceFilePath: mat.sourceFilePath ?? null,
          sourcePageNumber: mat.sourcePageNumber ?? null,
          updatedAt: sql`now()`,
        },
      });
  }
  console.log(`  materials:      ${items.length} upserted`);
}

async function upsertQuestions() {
  const items = loadQuestions();

  for (const q of items) {
    const correct = q.choices.find((c) => c.isCorrect)!;

    const inserted = await db
      .insert(questions)
      .values({
        externalKey: q.externalKey,
        examYear: q.examYear,
        examSeason: q.examSeason,
        questionNumber: q.questionNumber,
        stem: q.stem,
        correctChoiceLabel: correct.label,
        majorCategory: q.majorCategory,
        formatType: q.formatType,
        trapType: q.trapType,
        explanation: q.explanation,
        originType: q.originType,
        sourceNote: q.sourceNote ?? null,
        sourceFilePath: q.sourceFilePath ?? null,
        sourcePageNumber: q.sourcePageNumber ?? null,
      })
      .onConflictDoUpdate({
        target: questions.externalKey,
        set: {
          examYear: q.examYear,
          examSeason: q.examSeason,
          questionNumber: q.questionNumber,
          stem: q.stem,
          correctChoiceLabel: correct.label,
          majorCategory: q.majorCategory,
          formatType: q.formatType,
          trapType: q.trapType,
          explanation: q.explanation,
          originType: q.originType,
          sourceNote: q.sourceNote ?? null,
          sourceFilePath: q.sourceFilePath ?? null,
          sourcePageNumber: q.sourcePageNumber ?? null,
          updatedAt: sql`now()`,
        },
      })
      .returning({ id: questions.id });

    const questionId = inserted[0].id;

    // Replace child rows: delete-then-insert
    await db.delete(choices).where(eq(choices.questionId, questionId));
    if (q.choices.length > 0) {
      await db.insert(choices).values(
        q.choices.map((c) => ({
          questionId,
          label: c.label,
          body: c.body,
          isCorrect: c.isCorrect,
          whyAttractive: c.whyAttractive,
          misconceptionSlug: c.misconceptionSlug,
        }))
      );
    }

    await db
      .delete(questionTopics)
      .where(eq(questionTopics.questionId, questionId));
    for (const ts of q.topicSlugs) {
      const t = await db.query.topics.findFirst({
        where: eq(topics.slug, ts.slug),
      });
      if (!t) continue;
      await db.insert(questionTopics).values({
        questionId,
        topicId: t.id,
        weight: ts.weight,
      });
    }

    await db
      .delete(questionMisconceptions)
      .where(eq(questionMisconceptions.questionId, questionId));
    for (const ms of q.misconceptionSlugs) {
      const m = await db.query.misconceptions.findFirst({
        where: eq(misconceptions.slug, ms.slug),
      });
      if (!m) continue;
      await db.insert(questionMisconceptions).values({
        questionId,
        misconceptionId: m.id,
        weight: ms.weight,
      });
    }

    await db
      .delete(questionMaterials)
      .where(eq(questionMaterials.questionId, questionId));
    for (const ms of q.materialSlugs) {
      const m = await db.query.materials.findFirst({
        where: eq(materials.slug, ms.slug),
      });
      if (!m) continue;
      await db.insert(questionMaterials).values({
        questionId,
        materialId: m.id,
        role: ms.role,
      });
    }
  }
  console.log(`  questions:      ${items.length} upserted (with choices/relations)`);
}

async function main() {
  console.log("Seeding from content/structured/ ...");
  await upsertTopics();
  await upsertMisconceptions();
  await upsertMaterials();
  await upsertQuestions();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

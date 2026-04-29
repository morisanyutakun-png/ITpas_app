import {
  loadMaterials,
  loadMisconceptions,
  loadQuestions,
  loadStudyLessons,
  loadTopics,
} from "./loadStructured";

function main() {
  let topicSlugs: Set<string>;
  let misconceptionSlugs: Set<string>;
  let materialSlugs: Set<string>;

  console.log("Validating content/structured/...");
  try {
    const topics = loadTopics();
    const misconceptions = loadMisconceptions();
    const materials = loadMaterials();
    const questions = loadQuestions();
    const studyLessons = loadStudyLessons();

    topicSlugs = new Set(topics.map((t) => t.slug));
    misconceptionSlugs = new Set(misconceptions.map((m) => m.slug));
    materialSlugs = new Set(materials.map((m) => m.slug));

    console.log(`  topics:         ${topics.length}`);
    console.log(`  misconceptions: ${misconceptions.length}`);
    console.log(`  materials:      ${materials.length}`);
    console.log(`  questions:      ${questions.length}`);
    console.log(`  study lessons:  ${studyLessons.length}`);

    const errors: string[] = [];
    for (const q of questions) {
      for (const ts of q.topicSlugs) {
        if (!topicSlugs.has(ts.slug)) {
          errors.push(
            `Q ${q.externalKey}: unknown topicSlug '${ts.slug}'`
          );
        }
      }
      for (const ms of q.misconceptionSlugs) {
        if (!misconceptionSlugs.has(ms.slug)) {
          errors.push(
            `Q ${q.externalKey}: unknown misconceptionSlug '${ms.slug}'`
          );
        }
      }
      for (const c of q.choices) {
        if (c.misconceptionSlug && !misconceptionSlugs.has(c.misconceptionSlug)) {
          errors.push(
            `Q ${q.externalKey} choice ${c.label}: unknown misconceptionSlug '${c.misconceptionSlug}'`
          );
        }
      }
      for (const m of q.materialSlugs) {
        if (!materialSlugs.has(m.slug)) {
          errors.push(
            `Q ${q.externalKey}: unknown materialSlug '${m.slug}'`
          );
        }
      }
    }

    // Study lessons must reference an existing topic by slug.
    for (const l of studyLessons) {
      if (!topicSlugs.has(l.slug)) {
        errors.push(
          `Lesson ${l.slug}: no topic with this slug exists in content/structured/topics/`
        );
      }
    }

    if (errors.length > 0) {
      console.error("\n[!] Reference errors:");
      errors.forEach((e) => console.error(`  - ${e}`));
      process.exit(1);
    }
    console.log("OK");
  } catch (err) {
    console.error("[!] Schema validation failed:");
    console.error(err);
    process.exit(1);
  }
}

main();

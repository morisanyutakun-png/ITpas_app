/**
 * One-shot: add originType + sourceNote to every question JSON
 * if they're missing. All current questions are ipa_inspired
 * (original wording, written based on IPA syllabus topics).
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dir = join(process.cwd(), "content/structured/questions");
const files = readdirSync(dir).filter((f) => f.endsWith(".json"));

let updated = 0;
for (const f of files) {
  const path = join(dir, f);
  const raw = JSON.parse(readFileSync(path, "utf8"));
  let changed = false;

  if (raw.originType === undefined) {
    raw.originType = "ipa_inspired";
    changed = true;
  }
  if (raw.sourceNote === undefined) {
    raw.sourceNote =
      "IPA ITパスポート試験の出題範囲・頻出論点を元に作成したオリジナル問題です。実際の過去問の文言とは異なります。";
    changed = true;
  }

  if (changed) {
    writeFileSync(path, JSON.stringify(raw, null, 2) + "\n", "utf8");
    updated++;
    console.log(`  + ${f}`);
  }
}
console.log(`\n${updated} files updated.`);

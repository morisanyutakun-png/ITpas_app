/**
 * One-shot: rewrite sourceNote on all ipa_actual questions to IPA's
 * official citation format and add modifiedNote.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dir = join(process.cwd(), "content/structured/questions");
const files = readdirSync(dir).filter((f) => f.endsWith(".json"));

const SEASON_LABEL: Record<string, string> = {
  spring: "春期",
  autumn: "秋期",
  annual: "",
};

let updated = 0;
for (const f of files) {
  const path = join(dir, f);
  const raw = JSON.parse(readFileSync(path, "utf8"));
  if (raw.originType !== "ipa_actual") continue;

  const season = SEASON_LABEL[raw.examSeason] ?? "";
  const newSourceNote = `出典：令和${raw.examYear}年度${season ? " " + season : ""} ITパスポート試験 公開問題 問${raw.questionNumber}`;
  const newModifiedNote =
    "原典のスキャン PDF を OCR で読み取って構造化しました。OCR起因の表記揺れ (全角/半角、句読点の統一など) のみ整え、設問の意味・選択肢・正解は一切変更していません。";

  if (raw.sourceNote !== newSourceNote || raw.modifiedNote !== newModifiedNote) {
    raw.sourceNote = newSourceNote;
    raw.modifiedNote = newModifiedNote;
    writeFileSync(path, JSON.stringify(raw, null, 2) + "\n", "utf8");
    updated++;
    console.log(`  + ${f}`);
  }
}
console.log(`\n${updated} files updated.`);

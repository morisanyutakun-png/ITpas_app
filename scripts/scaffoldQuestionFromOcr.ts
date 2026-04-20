/**
 * Scaffold a content/structured/questions/*.json stub from OCR text.
 *
 * This is a *draft helper* — the output MUST be human-reviewed before commit.
 * The JSON placeholders it inserts (whyAttractive, explanation, topicSlugs)
 * are deliberately empty so `pnpm validate:content` will fail until a human
 * fills them. That is the point: prevent mass-import of unreviewed questions
 * while reducing the mechanical typing cost of the first draft.
 *
 * Usage:
 *   npx tsx scripts/scaffoldQuestionFromOcr.ts <stem> <questionNumber> <pageNumber>
 *   # e.g.  npx tsx scripts/scaffoldQuestionFromOcr.ts r06 12 5
 *
 * The script reads content/extracted/<stem>.pages/page-<NN>.txt, attempts to
 * locate the requested question block (問NN), and writes
 * content/structured/questions/<stem>_q<NN>.json with the OCR'd choices as
 * starting values. You then:
 *   1. Open the stub alongside the original PDF.
 *   2. Correct OCR errors and paraphrase/cite per LEGAL.md.
 *   3. Fill whyAttractive for each wrong choice (required).
 *   4. Fill explanation, topicSlugs, misconceptionSlugs.
 *   5. Run pnpm validate:content.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getExamSourceByYear, getExamSources } from "../src/lib/examSources";

type ChoiceStub = {
  label: "ア" | "イ" | "ウ" | "エ";
  body: string;
  isCorrect: boolean;
  whyAttractive: string | null;
  misconceptionSlug: string | null;
};

function padPage(n: number): string {
  return String(n).padStart(2, "0");
}

function findQuestionBlock(
  text: string,
  questionNumber: number
): { stem: string; choices: ChoiceStub[] } | null {
  // OCR often renders 問 as either 問 or 間. Normalize.
  const normalized = text.replace(/間(\s*\d+)/g, "問$1");
  const re = new RegExp(
    `問\\s*${questionNumber}\\s*([\\s\\S]*?)(?=問\\s*\\d+|$)`,
    "m"
  );
  const m = normalized.match(re);
  if (!m) return null;

  const body = m[1].trim();
  // Split on choice labels ア/イ/ウ/エ (possibly preceded by spaces/newlines).
  const parts = body.split(/\n\s*(ア|イ|ウ|エ)\s*/);
  if (parts.length < 9) return null; // stem + 4 × (label+body)

  const stem = parts[0].trim();
  const labels: ChoiceStub["label"][] = ["ア", "イ", "ウ", "エ"];
  const choices: ChoiceStub[] = [];
  for (let i = 0; i < 4; i++) {
    const label = parts[1 + i * 2] as ChoiceStub["label"];
    const bodyText = (parts[2 + i * 2] ?? "").trim();
    if (!labels.includes(label)) return null;
    choices.push({
      label,
      body: bodyText,
      isCorrect: false,
      whyAttractive: null,
      misconceptionSlug: null,
    });
  }
  return { stem, choices };
}

function main() {
  const [stem, qStr, pageStr] = process.argv.slice(2);
  if (!stem || !qStr || !pageStr) {
    console.error(
      "Usage: tsx scripts/scaffoldQuestionFromOcr.ts <stem> <questionNumber> <pageNumber>"
    );
    console.error(
      "  e.g. tsx scripts/scaffoldQuestionFromOcr.ts r06 12 5"
    );
    process.exit(2);
  }
  const questionNumber = Number(qStr);
  const pageNumber = Number(pageStr);
  if (!Number.isInteger(questionNumber) || !Number.isInteger(pageNumber)) {
    throw new Error("questionNumber and pageNumber must be integers");
  }

  const sources = getExamSources();
  const source = sources.find((s) => s.slug === stem);
  if (!source) {
    console.error(
      `Unknown stem '${stem}'. Known: ${sources.map((s) => s.slug).join(", ")}`
    );
    process.exit(2);
  }

  const pagePath = join(
    process.cwd(),
    "content",
    "extracted",
    `${stem}.pages`,
    `page-${padPage(pageNumber)}.txt`
  );
  if (!existsSync(pagePath)) {
    throw new Error(`Page file not found: ${pagePath}`);
  }
  const text = readFileSync(pagePath, "utf8");
  const block = findQuestionBlock(text, questionNumber);

  const externalKey = `${stem}_q${String(questionNumber).padStart(2, "0")}`;
  const outPath = join(
    process.cwd(),
    "content",
    "structured",
    "questions",
    `${externalKey}.json`
  );
  if (existsSync(outPath)) {
    console.error(
      `Refusing to overwrite existing file: ${outPath}\n` +
        `  Edit it in place or delete it first.`
    );
    process.exit(1);
  }

  const stub = {
    externalKey,
    examYear: source.examYear,
    examSeason: source.examSeason,
    questionNumber,
    majorCategory: "__FILL_ME__ (strategy|management|technology)",
    formatType: "__FILL_ME__ (definition|comparison|case|...)",
    trapType: "none",
    stem: block?.stem ?? "__FILL_ME__: OCR抽出失敗。原典PDFから転記してください。",
    choices:
      block?.choices ??
      (["ア", "イ", "ウ", "エ"] as const).map((label) => ({
        label,
        body: "__FILL_ME__",
        isCorrect: false,
        whyAttractive: null,
        misconceptionSlug: null,
      })),
    explanation: "__FILL_ME__: なぜ正解か／他はなぜ違うかを構造化して書く。",
    keyInsight: null,
    commonMistakeFlow: null,
    topicSlugs: [],
    misconceptionSlugs: [],
    materialSlugs: [],
    originType: "ipa_actual",
    sourceNote: `出典：${source.label} 問${questionNumber}`,
    modifiedNote:
      "原典のスキャン PDF を OCR で読み取って構造化しました。OCR起因の表記揺れ (全角/半角、句読点の統一など) のみ整え、設問の意味・選択肢・正解は一切変更していません。",
    sourceFilePath: source.sourceFilePath ?? null,
    sourcePageNumber: pageNumber,
  };

  writeFileSync(outPath, JSON.stringify(stub, null, 2) + "\n", "utf8");
  console.log(`Wrote stub: ${outPath}`);
  console.log("");
  console.log("Next steps (manual review is REQUIRED):");
  console.log("  1. Open the original PDF page and this stub side-by-side.");
  console.log("  2. Fix OCR artefacts in stem/choices.");
  console.log("  3. Mark the correct choice (isCorrect=true for exactly one).");
  console.log("  4. Fill whyAttractive for each WRONG choice (empty = validation fail).");
  console.log("  5. Fill majorCategory, formatType, topicSlugs, misconceptionSlugs.");
  console.log("  6. Write explanation / keyInsight / commonMistakeFlow.");
  console.log("  7. pnpm validate:content && pnpm seed");
  console.log("");
  console.log(
    "IMPORTANT: whyAttractive must be non-empty for all wrong choices; the"
  );
  console.log(
    "validator will otherwise reject the file. This gate exists on purpose."
  );
}

void getExamSourceByYear; // keep import list honest
main();

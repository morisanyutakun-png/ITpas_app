/**
 * OCR pipeline for IPA past-exam PDFs.
 *
 * Pipeline:
 *   PDF (scanned image)
 *     -> pdftoppm  -> per-page PNG (300 DPI, grayscale)
 *     -> tesseract -> per-page UTF-8 text (jpn + jpn_vert)
 *     -> single combined .txt with form-feed page separators
 *
 * Requires: poppler (pdftoppm) and tesseract + tesseract-lang (jpn).
 *
 * Usage:
 *   npx tsx scripts/extractPdfOcr.ts content/raw/past_exams/r07.pdf
 *   # Optionally limit pages:  --pages 1-12
 *
 * Output:
 *   content/extracted/<basename>.txt
 *   content/extracted/<basename>.pages/page-<NNN>.txt   (per-page text)
 *
 * Manual review is REQUIRED — Japanese OCR has errors. Use the per-page
 * files alongside the original PDF page to write the structured JSON.
 */
import { execSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { basename, extname, join } from "node:path";
import { tmpdir } from "node:os";

function which(cmd: string): boolean {
  try {
    execSync(`which ${cmd}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function parsePages(arg: string | undefined): { first?: number; last?: number } {
  if (!arg) return {};
  const m = arg.match(/^(\d+)(?:-(\d+))?$/);
  if (!m) throw new Error(`bad --pages value: ${arg}`);
  const first = Number(m[1]);
  const last = m[2] ? Number(m[2]) : first;
  return { first, last };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Usage: tsx scripts/extractPdfOcr.ts <pdf> [--pages N[-M]]");
    process.exit(2);
  }
  const pdf = args[0];
  const pagesIdx = args.indexOf("--pages");
  const pages = parsePages(pagesIdx >= 0 ? args[pagesIdx + 1] : undefined);

  if (!existsSync(pdf)) throw new Error(`pdf not found: ${pdf}`);
  if (!which("pdftoppm")) throw new Error("pdftoppm not installed (brew install poppler)");
  if (!which("tesseract")) throw new Error("tesseract not installed (brew install tesseract tesseract-lang)");

  const langs = execSync("tesseract --list-langs 2>&1", { encoding: "utf8" });
  if (!langs.includes("jpn")) {
    throw new Error(
      "Japanese language pack missing. Install with: brew install tesseract-lang"
    );
  }

  const stem = basename(pdf, extname(pdf));
  const outDir = join("content", "extracted");
  const pageDir = join(outDir, `${stem}.pages`);
  mkdirSync(pageDir, { recursive: true });

  // 1. PDF -> PNG (300 DPI grayscale)
  const tmp = join(tmpdir(), `itpas-ocr-${process.pid}`);
  mkdirSync(tmp, { recursive: true });
  try {
    const rangeArgs =
      pages.first && pages.last
        ? `-f ${pages.first} -l ${pages.last}`
        : pages.first
          ? `-f ${pages.first}`
          : "";
    console.log(`[1/2] pdftoppm: ${pdf} -> PNG @ 300 DPI`);
    execSync(
      `pdftoppm -png -gray -r 300 ${rangeArgs} "${pdf}" "${tmp}/page"`,
      { stdio: "inherit" }
    );

    const images = readdirSync(tmp)
      .filter((f) => f.endsWith(".png"))
      .sort();
    console.log(`     produced ${images.length} page images`);

    // 2. Tesseract OCR per page
    console.log(`[2/2] tesseract: OCR each page (jpn)`);
    const combined: string[] = [];
    for (const img of images) {
      const m = img.match(/page-(\d+)\.png$/);
      const num = m ? m[1] : img.replace(/\D/g, "");
      const outBase = join(pageDir, `page-${num}`);
      execSync(
        `tesseract "${tmp}/${img}" "${outBase}" -l jpn --psm 6 -c preserve_interword_spaces=1`,
        { stdio: ["ignore", "ignore", "ignore"] }
      );
      const text = readFileSync(`${outBase}.txt`, "utf8");
      combined.push(`\n===== PAGE ${num} =====\n${text}`);
      process.stdout.write(".");
    }
    console.log("");

    writeFileSync(join(outDir, `${stem}.txt`), combined.join("\n"), "utf8");
    console.log(`\nWrote:\n  ${outDir}/${stem}.txt\n  ${pageDir}/page-NNN.txt (per-page)`);
    console.log(
      "\nNOTE: Japanese OCR is imperfect. Open the .txt next to the original PDF and"
    );
    console.log(
      "     manually correct each question before saving as content/structured/questions/*.json."
    );
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

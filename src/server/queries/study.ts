import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { studyLessonZ, type StudyLesson } from "@/lib/contentSchema";

const STUDY_DIR = path.join(process.cwd(), "content", "structured", "study");

/**
 * Read a single study lesson by slug. Returns null if the JSON file does
 * not exist or fails schema validation — callers should treat that as
 * "no input content for this topic yet" rather than a hard error.
 *
 * Lessons live on the filesystem (not the DB) because they're authored
 * content versioned with the rest of the source tree. This matches the
 * project's "content/structured/ is the source of truth" rule.
 */
export async function getStudyLesson(slug: string): Promise<StudyLesson | null> {
  const fp = path.join(STUDY_DIR, `${slug}.json`);
  try {
    const raw = await fs.readFile(fp, "utf8");
    const parsed = studyLessonZ.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      console.warn(`[study] schema invalid for ${slug}:`, parsed.error.message);
      return null;
    }
    return parsed.data;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

/** List all slugs that have a lesson file. Used by the index page. */
export async function listStudyLessonSlugs(): Promise<string[]> {
  try {
    const entries = await fs.readdir(STUDY_DIR);
    return entries
      .filter((n) => n.endsWith(".json"))
      .map((n) => n.replace(/\.json$/, ""))
      .sort();
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

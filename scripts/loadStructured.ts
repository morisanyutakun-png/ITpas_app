import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import {
  materialFrontmatterZ,
  misconceptionFileZ,
  questionFileZ,
  studyLessonZ,
  topicFileZ,
  type MaterialFrontmatter,
  type MisconceptionFile,
  type QuestionFile,
  type StudyLesson,
  type TopicFile,
} from "../src/lib/contentSchema";

const CONTENT_ROOT = join(process.cwd(), "content", "structured");

function listJsonFiles(dir: string): string[] {
  try {
    return readdirSync(dir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => join(dir, f));
  } catch {
    return [];
  }
}

function listMarkdownFiles(dir: string): string[] {
  try {
    return readdirSync(dir)
      .filter((f) => f.endsWith(".md"))
      .map((f) => join(dir, f));
  } catch {
    return [];
  }
}

export function loadTopics(): TopicFile[] {
  return listJsonFiles(join(CONTENT_ROOT, "topics")).map((p) => {
    const raw = JSON.parse(readFileSync(p, "utf8"));
    return topicFileZ.parse(raw);
  });
}

export function loadMisconceptions(): MisconceptionFile[] {
  return listJsonFiles(join(CONTENT_ROOT, "misconceptions")).map((p) => {
    const raw = JSON.parse(readFileSync(p, "utf8"));
    return misconceptionFileZ.parse(raw);
  });
}

export function loadMaterials(): Array<MaterialFrontmatter & { body: string }> {
  return listMarkdownFiles(join(CONTENT_ROOT, "materials")).map((p) => {
    const file = readFileSync(p, "utf8");
    const parsed = matter(file);
    const fm = materialFrontmatterZ.parse(parsed.data);
    return { ...fm, body: parsed.content.trim() };
  });
}

export function loadQuestions(): QuestionFile[] {
  return listJsonFiles(join(CONTENT_ROOT, "questions")).map((p) => {
    const raw = JSON.parse(readFileSync(p, "utf8"));
    return questionFileZ.parse(raw);
  });
}

export function loadStudyLessons(): StudyLesson[] {
  return listJsonFiles(join(CONTENT_ROOT, "study")).map((p) => {
    const raw = JSON.parse(readFileSync(p, "utf8"));
    return studyLessonZ.parse(raw);
  });
}

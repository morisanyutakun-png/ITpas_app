import "server-only";
import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { questionTopics, topics } from "@/db/schema";
import { listStudyLessonSlugs } from "./study";

type Major = "strategy" | "management" | "technology";

export type CurriculumChapter = {
  slug: string;
  title: string;
  summary: string;
  questionCount: number;
  hasLesson: boolean;
  attempted: number;
  correct: number;
  correctRate: number;
  /** unstarted | learning | settled | mastered */
  status: "unstarted" | "learning" | "settled" | "mastered";
};

export type CurriculumMinor = {
  minorTopic: string;
  chapters: CurriculumChapter[];
  withLessonCount: number;
  masteredCount: number;
};

export type Curriculum = {
  major: Major;
  label: string;
  intro: string;
  hue: string;
  minors: CurriculumMinor[];
  totalChapters: number;
  withLessonCount: number;
  attemptedChapters: number;
  masteredChapters: number;
};

const MAJOR_INFO: Record<Major, { label: string; intro: string; hue: string }> = {
  strategy: {
    label: "ストラテジ系",
    intro:
      "経営戦略・マーケティング・法務・経営分析など、ビジネス側の論点群。略語が多く、対象（顧客／資源／市場）を取り違えやすいので『何を分析する手法か』を 1 語で答えられる状態を目指します。",
    hue: "#FF375F",
  },
  management: {
    label: "マネジメント系",
    intro:
      "プロジェクトマネジメントとサービスマネジメントが 2 大柱。図表の『何を見せる図か』、ITIL の『インシデント vs 問題』のような境界が頻出します。",
    hue: "#FF9500",
  },
  technology: {
    label: "テクノロジ系",
    intro:
      "ネットワーク・セキュリティ・データベース・ハードウェア・AI など。所属層・機能の境界・暗号方式の使い分けが繰り返し問われます。",
    hue: "#0A84FF",
  },
};

function statusOf(
  attempted: number,
  rate: number
): CurriculumChapter["status"] {
  if (attempted === 0) return "unstarted";
  if (rate >= 0.85) return "mastered";
  if (rate >= 0.6) return "settled";
  return "learning";
}

/**
 * Build a full curriculum for one major: all topics under it, grouped by
 * minor topic, annotated with whether a study lesson exists and the
 * user's progress on each topic. This powers `/curriculum/[major]`.
 */
export async function getCurriculum(
  major: Major,
  userId: string | null
): Promise<Curriculum> {
  const info = MAJOR_INFO[major];

  // 1) All topics in this major
  const ts = await db
    .select({
      slug: topics.slug,
      title: topics.title,
      summary: topics.summary,
      minorTopic: topics.minorTopic,
    })
    .from(topics)
    .where(eq(topics.majorCategory, major))
    .orderBy(asc(topics.minorTopic), asc(topics.title));

  // 2) Question counts per topic
  const qCountRows = await db
    .select({
      slug: topics.slug,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(questionTopics)
    .innerJoin(topics, eq(topics.id, questionTopics.topicId))
    .where(eq(topics.majorCategory, major))
    .groupBy(topics.slug);
  const qCount = new Map(qCountRows.map((r) => [r.slug, Number(r.count)]));

  // 3) Per-user progress (only if signed in)
  const progress = new Map<string, { attempted: number; correct: number }>();
  if (userId) {
    const rows = await db.execute(sql`
      SELECT
        t.slug AS slug,
        COUNT(*)::int AS attempted,
        SUM(CASE WHEN a.result = 'correct' THEN 1 ELSE 0 END)::int AS correct
      FROM attempts a
      JOIN question_topics qt ON qt.question_id = a.question_id
      JOIN topics t ON t.id = qt.topic_id
      WHERE a.user_id = ${userId}
        AND t.major_category = ${major}
        AND a.result IN ('correct', 'incorrect')
      GROUP BY t.slug
    `);
    for (const r of rows.rows as Array<Record<string, unknown>>) {
      progress.set(String(r.slug), {
        attempted: Number(r.attempted ?? 0),
        correct: Number(r.correct ?? 0),
      });
    }
  }

  // 4) Which topics have an authored lesson
  const lessonSlugs = new Set(await listStudyLessonSlugs());

  // 5) Group by minor topic, preserving the order from the SQL.
  const minorMap = new Map<string, CurriculumChapter[]>();
  for (const t of ts) {
    const p = progress.get(t.slug) ?? { attempted: 0, correct: 0 };
    const rate = p.attempted > 0 ? p.correct / p.attempted : 0;
    const ch: CurriculumChapter = {
      slug: t.slug,
      title: t.title,
      summary: t.summary,
      questionCount: qCount.get(t.slug) ?? 0,
      hasLesson: lessonSlugs.has(t.slug),
      attempted: p.attempted,
      correct: p.correct,
      correctRate: rate,
      status: statusOf(p.attempted, rate),
    };
    if (!minorMap.has(t.minorTopic)) minorMap.set(t.minorTopic, []);
    minorMap.get(t.minorTopic)!.push(ch);
  }

  // 6) Sort each minor: lessons first, then mastered, then by title.
  const minors: CurriculumMinor[] = [];
  for (const [name, chapters] of minorMap.entries()) {
    chapters.sort((a, b) => {
      if (a.hasLesson !== b.hasLesson) return a.hasLesson ? -1 : 1;
      if (a.status !== b.status) {
        const order = { unstarted: 0, learning: 1, settled: 2, mastered: 3 };
        return order[a.status] - order[b.status];
      }
      return a.title.localeCompare(b.title, "ja");
    });
    minors.push({
      minorTopic: name,
      chapters,
      withLessonCount: chapters.filter((c) => c.hasLesson).length,
      masteredCount: chapters.filter((c) => c.status === "mastered").length,
    });
  }

  const totalChapters = ts.length;
  const withLessonCount = minors.reduce((s, m) => s + m.withLessonCount, 0);
  const flat = minors.flatMap((m) => m.chapters);
  return {
    major,
    label: info.label,
    intro: info.intro,
    hue: info.hue,
    minors,
    totalChapters,
    withLessonCount,
    attemptedChapters: flat.filter((c) => c.status !== "unstarted").length,
    masteredChapters: flat.filter((c) => c.status === "mastered").length,
  };
}

/**
 * Find the next chapter in the same major that has a lesson available,
 * coming after `currentSlug`. Returns null if there is no next lesson.
 * Used for the "次の章へ" handoff at the end of a lesson.
 */
export async function getNextChapterWithLesson(
  major: Major,
  currentSlug: string
): Promise<{ slug: string; title: string } | null> {
  const c = await getCurriculum(major, null);
  const flat = c.minors.flatMap((m) =>
    m.chapters.filter((ch) => ch.hasLesson).map((ch) => ({
      slug: ch.slug,
      title: ch.title,
    }))
  );
  const idx = flat.findIndex((ch) => ch.slug === currentSlug);
  if (idx < 0 || idx + 1 >= flat.length) return null;
  return flat[idx + 1];
}

import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { topics } from "@/db/schema";

export type RoadmapTopic = {
  slug: string;
  title: string;
  summary: string;
  attempted: number;
  correct: number;
  /** 0 = 未挑戦, 1 = 伸ばす (<60%), 2 = 定着 (60-85%), 3 = 習熟 (>=85%) */
  level: 0 | 1 | 2 | 3;
  correctRate: number;
};

export type RoadmapMinor = {
  minorTopic: string;
  topics: RoadmapTopic[];
  topicCount: number;
  masteredCount: number;
};

export type RoadmapMajor = {
  major: "strategy" | "management" | "technology";
  label: string;
  intro: string;
  minors: RoadmapMinor[];
  topicCount: number;
  masteredCount: number;
  attemptedCount: number;
};

const MAJOR_ORDER: Array<"strategy" | "management" | "technology"> = [
  "strategy",
  "management",
  "technology",
];

const MAJOR_META: Record<
  "strategy" | "management" | "technology",
  { label: string; intro: string }
> = {
  strategy: {
    label: "ストラテジ系",
    intro: "経営・マーケ・法務。略語ゲーの山を崩す。",
  },
  management: {
    label: "マネジメント系",
    intro: "PMとサービスマネジメント。境界線が勝負。",
  },
  technology: {
    label: "テクノロジ系",
    intro: "NW / セキュリティ / DB / 新技術。層を意識。",
  },
};

function levelOf(attempted: number, rate: number): 0 | 1 | 2 | 3 {
  if (attempted === 0) return 0;
  if (rate >= 0.85) return 3;
  if (rate >= 0.6) return 2;
  return 1;
}

/**
 * Full learning roadmap for a user (or an empty one for anonymous).
 *
 * Returns the 3 majors → minorTopic groups → topics (with progress levels),
 * without ever leaking question stems or raw DB rows beyond slug/title/summary.
 */
export async function getRoadmap(userId: string | null): Promise<RoadmapMajor[]> {
  // Pull all topics in display order.
  const all = await db
    .select({
      slug: topics.slug,
      title: topics.title,
      summary: topics.summary,
      majorCategory: topics.majorCategory,
      minorTopic: topics.minorTopic,
    })
    .from(topics)
    .orderBy(asc(topics.majorCategory), asc(topics.minorTopic), asc(topics.title));

  // Progress per topic (only if signed in).
  let progressBySlug = new Map<string, { attempted: number; correct: number }>();
  if (userId) {
    const rows = await db.execute(sql`
      SELECT
        t.slug AS slug,
        COUNT(*)::int AS attempted,
        SUM(CASE WHEN a.result = 'correct' THEN 1 ELSE 0 END)::int AS correct
      FROM attempts a
      JOIN question_topics qt ON qt.question_id = a.question_id
      JOIN topics t ON t.id = qt.topic_id
      WHERE a.user_id = ${userId} AND a.result IN ('correct', 'incorrect')
      GROUP BY t.slug
    `);
    for (const r of rows.rows as Array<Record<string, unknown>>) {
      progressBySlug.set(String(r.slug), {
        attempted: Number(r.attempted ?? 0),
        correct: Number(r.correct ?? 0),
      });
    }
  }

  // Group by major → minorTopic.
  const tree = new Map<string, Map<string, RoadmapTopic[]>>();
  for (const t of all) {
    const p = progressBySlug.get(t.slug) ?? { attempted: 0, correct: 0 };
    const rate = p.attempted ? p.correct / p.attempted : 0;
    const tp: RoadmapTopic = {
      slug: t.slug,
      title: t.title,
      summary: t.summary,
      attempted: p.attempted,
      correct: p.correct,
      correctRate: rate,
      level: levelOf(p.attempted, rate),
    };
    if (!tree.has(t.majorCategory)) tree.set(t.majorCategory, new Map());
    const minors = tree.get(t.majorCategory)!;
    if (!minors.has(t.minorTopic)) minors.set(t.minorTopic, []);
    minors.get(t.minorTopic)!.push(tp);
  }

  return MAJOR_ORDER.map((m) => {
    const minors = tree.get(m) ?? new Map<string, RoadmapTopic[]>();
    const minorList: RoadmapMinor[] = Array.from(minors.entries()).map(
      ([minor, list]) => ({
        minorTopic: minor,
        topics: list,
        topicCount: list.length,
        masteredCount: list.filter((t) => t.level === 3).length,
      })
    );
    const flat = minorList.flatMap((x) => x.topics);
    return {
      major: m,
      label: MAJOR_META[m].label,
      intro: MAJOR_META[m].intro,
      minors: minorList,
      topicCount: flat.length,
      masteredCount: flat.filter((t) => t.level === 3).length,
      attemptedCount: flat.filter((t) => t.level > 0).length,
    };
  });
}

/** Summarised counts per major. Used by the new /learn/questions pillars view. */
export async function getMajorSummaries(
  userId: string | null
): Promise<RoadmapMajor[]> {
  return getRoadmap(userId);
}

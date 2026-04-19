import { sql } from "drizzle-orm";
import { db } from "@/db/client";

export type HistoryRow = {
  attemptId: string;
  questionId: string;
  externalKey: string;
  examYear: number;
  questionNumber: number;
  majorCategory: string;
  formatType: string;
  stem: string;
  selectedChoiceLabel: string | null;
  result: "correct" | "incorrect" | "skipped";
  durationMs: number;
  createdAt: Date;
};

export async function getRecentHistory(
  userId: string,
  limit = 50
): Promise<HistoryRow[]> {
  const rows = await db.execute(sql`
    SELECT
      a.id AS "attemptId",
      a.question_id AS "questionId",
      q.external_key AS "externalKey",
      q.exam_year AS "examYear",
      q.question_number AS "questionNumber",
      q.major_category AS "majorCategory",
      q.format_type AS "formatType",
      q.stem AS "stem",
      a.selected_choice_label AS "selectedChoiceLabel",
      a.result AS "result",
      a.duration_ms AS "durationMs",
      a.created_at AS "createdAt"
    FROM attempts a
    JOIN questions q ON q.id = a.question_id
    WHERE a.user_id = ${userId}
    ORDER BY a.created_at DESC
    LIMIT ${limit}
  `);
  return rows.rows.map((r) => ({
    attemptId: String((r as Record<string, unknown>).attemptId),
    questionId: String((r as Record<string, unknown>).questionId),
    externalKey: String((r as Record<string, unknown>).externalKey),
    examYear: Number((r as Record<string, unknown>).examYear),
    questionNumber: Number((r as Record<string, unknown>).questionNumber),
    majorCategory: String((r as Record<string, unknown>).majorCategory),
    formatType: String((r as Record<string, unknown>).formatType),
    stem: String((r as Record<string, unknown>).stem),
    selectedChoiceLabel: ((r as Record<string, unknown>).selectedChoiceLabel as string | null) ?? null,
    result: (r as Record<string, unknown>).result as "correct" | "incorrect" | "skipped",
    durationMs: Number((r as Record<string, unknown>).durationMs),
    createdAt: new Date(String((r as Record<string, unknown>).createdAt)),
  }));
}

export type DailyStat = { day: string; total: number; correct: number; rate: number };

export async function getDailyStats(userId: string, days = 14): Promise<DailyStat[]> {
  const rows = await db.execute(sql`
    SELECT
      to_char(date_trunc('day', a.created_at AT TIME ZONE 'Asia/Tokyo'), 'YYYY-MM-DD') AS "day",
      COUNT(*)::int AS "total",
      SUM(CASE WHEN a.result = 'correct' THEN 1 ELSE 0 END)::int AS "correct"
    FROM attempts a
    WHERE a.user_id = ${userId}
      AND a.result IN ('correct', 'incorrect')
      AND a.created_at >= now() - (${days} || ' days')::interval
    GROUP BY 1
    ORDER BY 1 ASC
  `);
  return rows.rows.map((r) => {
    const total = Number((r as Record<string, unknown>).total ?? 0);
    const correct = Number((r as Record<string, unknown>).correct ?? 0);
    return {
      day: String((r as Record<string, unknown>).day),
      total,
      correct,
      rate: total ? correct / total : 0,
    };
  });
}

export type RecommendedTopic = {
  slug: string;
  title: string;
  attempted: number;
  correctRate: number;
  reason: string;
};

/**
 * Recommendation rules:
 *   1. If user has weak topics (correctRate<0.6 with >=2 attempts), surface
 *      the weakest one as "弱点補強".
 *   2. Otherwise surface a topic the user hasn't touched yet ("未挑戦の論点").
 */
export async function getRecommendation(userId: string): Promise<RecommendedTopic | null> {
  const weak = await db.execute(sql`
    SELECT
      t.slug AS "slug",
      t.title AS "title",
      COUNT(*)::int AS "attempted",
      AVG(CASE WHEN a.result = 'correct' THEN 1.0 ELSE 0.0 END)::float AS "rate"
    FROM attempts a
    JOIN question_topics qt ON qt.question_id = a.question_id
    JOIN topics t ON t.id = qt.topic_id
    WHERE a.user_id = ${userId} AND a.result IN ('correct', 'incorrect')
    GROUP BY t.slug, t.title
    HAVING COUNT(*) >= 2 AND AVG(CASE WHEN a.result = 'correct' THEN 1.0 ELSE 0.0 END) < 0.6
    ORDER BY rate ASC
    LIMIT 1
  `);
  if (weak.rows.length > 0) {
    const w = weak.rows[0] as Record<string, unknown>;
    return {
      slug: String(w.slug),
      title: String(w.title),
      attempted: Number(w.attempted),
      correctRate: Number(w.rate),
      reason: "弱点補強",
    };
  }

  const fresh = await db.execute(sql`
    SELECT t.slug AS "slug", t.title AS "title"
    FROM topics t
    WHERE NOT EXISTS (
      SELECT 1
      FROM attempts a
      JOIN question_topics qt ON qt.question_id = a.question_id
      WHERE qt.topic_id = t.id AND a.user_id = ${userId}
    )
    ORDER BY random()
    LIMIT 1
  `);
  if (fresh.rows.length > 0) {
    const f = fresh.rows[0] as Record<string, unknown>;
    return {
      slug: String(f.slug),
      title: String(f.title),
      attempted: 0,
      correctRate: 0,
      reason: "未挑戦の論点",
    };
  }
  return null;
}

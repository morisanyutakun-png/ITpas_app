import { sql } from "drizzle-orm";
import { db } from "@/db/client";

export type SelectorMode = "weakness" | "topic" | "year" | "format" | "mixed";
export type SelectorFilters = {
  topicSlugs?: string[];
  misconceptionSlugs?: string[];
  examYear?: number;
  formatType?: string;
};

/**
 * Select question IDs in priority order based on the user's incorrect_rate
 * across linked misconceptions, with a recency penalty and unattempted bonus.
 *
 * MVP impl: scoring is a single SQL with safe defaults so it works on day 1
 * even with very few attempts.
 */
export async function selectQuestionIds(input: {
  userId: string;
  mode: SelectorMode;
  filters?: SelectorFilters;
  count: number;
  /** Plan-based floor: exclude questions with exam_year < minYear. */
  minYear?: number | null;
}): Promise<string[]> {
  const { userId, mode, filters = {}, count, minYear = null } = input;
  const limit = Math.max(1, Math.min(200, count));

  const topicCsv = (filters.topicSlugs ?? []).join(",");
  const miscCsv = (filters.misconceptionSlugs ?? []).join(",");

  const rows = await db.execute(sql`
    WITH user_misc AS (
      SELECT
        qm.misconception_id,
        SUM(CASE WHEN a.result = 'incorrect' THEN 1 ELSE 0 END)::float
          / NULLIF(COUNT(*), 0)::float AS rate,
        COUNT(*)::int AS attempts
      FROM attempts a
      JOIN question_misconceptions qm ON qm.question_id = a.question_id
      WHERE a.user_id = ${userId} AND a.result IN ('correct', 'incorrect')
      GROUP BY qm.misconception_id
    ),
    candidate AS (
      SELECT q.id, q.exam_year, q.format_type, q.major_category
      FROM questions q
      WHERE
        (${filters.examYear ?? null}::int IS NULL OR q.exam_year = ${filters.examYear ?? null})
        AND (${minYear}::int IS NULL OR q.exam_year >= ${minYear}::int)
        AND (${filters.formatType ?? null}::text IS NULL OR q.format_type::text = ${filters.formatType ?? null})
        AND (
          ${topicCsv}::text = ''
          OR EXISTS (
            SELECT 1 FROM question_topics qt
            JOIN topics t ON t.id = qt.topic_id
            WHERE qt.question_id = q.id
              AND t.slug = ANY(string_to_array(${topicCsv}::text, ','))
          )
        )
        AND (
          ${miscCsv}::text = ''
          OR EXISTS (
            SELECT 1 FROM question_misconceptions qm
            JOIN misconceptions m ON m.id = qm.misconception_id
            WHERE qm.question_id = q.id
              AND m.slug = ANY(string_to_array(${miscCsv}::text, ','))
          )
        )
    ),
    scored AS (
      SELECT
        c.id,
        COALESCE((
          SELECT SUM(qm.weight * COALESCE(um.rate, 0.3))
          FROM question_misconceptions qm
          LEFT JOIN user_misc um ON um.misconception_id = qm.misconception_id
          WHERE qm.question_id = c.id
        ), 0)::float AS misc_score,
        EXISTS (
          SELECT 1 FROM attempts a2
          WHERE a2.user_id = ${userId}
            AND a2.question_id = c.id
            AND a2.created_at > now() - interval '48 hours'
        ) AS recent,
        EXISTS (
          SELECT 1 FROM attempts a3
          WHERE a3.user_id = ${userId} AND a3.question_id = c.id
        ) AS attempted
      FROM candidate c
    )
    SELECT id
    FROM scored
    ORDER BY (
      misc_score
      + CASE WHEN attempted THEN 0 ELSE 0.2 END
      - CASE WHEN recent THEN 0.5 ELSE 0 END
      + (random() * 0.1)
    ) DESC
    LIMIT ${limit}
  `);

  // mode is reserved for future per-mode mixing logic — currently filters
  // do all the work and `mode` is recorded on the session for analytics.
  void mode;

  return (rows.rows as Array<{ id: string }>).map((r) => String(r.id));
}

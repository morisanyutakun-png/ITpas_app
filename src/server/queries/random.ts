import { sql } from "drizzle-orm";
import { db } from "@/db/client";

export async function pickRandomQuestionId(filters?: {
  originType?: "ipa_actual" | "ipa_inspired";
  majorCategory?: "strategy" | "management" | "technology";
  /** Plan-derived: exclude exam_year < minYear. */
  minYear?: number | null;
}): Promise<string | null> {
  const origin = filters?.originType ?? null;
  const major = filters?.majorCategory ?? null;
  const minYear = filters?.minYear ?? null;
  const rows = await db.execute(sql`
    SELECT id
    FROM questions
    WHERE
      (${origin}::text IS NULL OR origin_type::text = ${origin})
      AND (${major}::text IS NULL OR major_category::text = ${major})
      AND (${minYear}::int IS NULL OR exam_year >= ${minYear}::int)
    ORDER BY random()
    LIMIT 1
  `);
  if (rows.rows.length === 0) return null;
  return String((rows.rows[0] as { id: string }).id);
}

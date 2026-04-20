import { sql } from "drizzle-orm";
import { db } from "@/db/client";

export type BookmarkRow = {
  questionId: string;
  examYear: number;
  examSeason: string;
  questionNumber: number;
  majorCategory: string;
  formatType: string;
  stem: string;
  createdAt: string;
};

export async function getBookmarksForUser(userId: string): Promise<BookmarkRow[]> {
  const rows = await db.execute(sql`
    SELECT
      q.id AS question_id,
      q.exam_year, q.exam_season, q.question_number,
      q.major_category, q.format_type, q.stem,
      b.created_at
    FROM bookmarks b
    JOIN questions q ON q.id = b.question_id
    WHERE b.user_id = ${userId}
    ORDER BY b.created_at DESC
  `);
  return (rows.rows as Array<Record<string, unknown>>).map((r) => ({
    questionId: String(r.question_id),
    examYear: Number(r.exam_year),
    examSeason: String(r.exam_season),
    questionNumber: Number(r.question_number),
    majorCategory: String(r.major_category),
    formatType: String(r.format_type),
    stem: String(r.stem),
    createdAt: String(r.created_at),
  }));
}

export type LastAttempt = {
  questionId: string;
  result: "correct" | "incorrect" | "skipped";
  createdAt: string;
  sessionId: string | null;
};

/** Most recent attempt for the user — powers the "resume" CTA. */
export async function getLastAttempt(userId: string): Promise<LastAttempt | null> {
  const rows = await db.execute(sql`
    SELECT question_id, result, created_at, session_id
    FROM attempts
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 1
  `);
  const r = rows.rows[0] as Record<string, unknown> | undefined;
  if (!r) return null;
  return {
    questionId: String(r.question_id),
    result: String(r.result) as LastAttempt["result"],
    createdAt: String(r.created_at),
    sessionId: r.session_id ? String(r.session_id) : null,
  };
}

/**
 * Current streak: number of consecutive JST-days ending *today or yesterday*
 * on which the user made at least one answered attempt. If the user didn't
 * attempt today and didn't attempt yesterday either, streak is 0.
 */
export async function getStreakDays(userId: string): Promise<number> {
  const rows = await db.execute(sql`
    SELECT DISTINCT (date_trunc('day', created_at AT TIME ZONE 'Asia/Tokyo'))::date AS d
    FROM attempts
    WHERE user_id = ${userId} AND result IN ('correct', 'incorrect')
    ORDER BY d DESC
    LIMIT 365
  `);
  const days = (rows.rows as Array<Record<string, unknown>>).map((r) =>
    String(r.d)
  );
  if (days.length === 0) return 0;

  // Build today/yesterday in JST as YYYY-MM-DD.
  const nowJst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const today = fmt(nowJst);
  const yesterday = fmt(new Date(nowJst.getTime() - 86_400_000));

  // Must have attempted today or yesterday to count as an active streak.
  const latest = days[0].slice(0, 10);
  if (latest !== today && latest !== yesterday) return 0;

  let streak = 0;
  let cursor = new Date(latest + "T00:00:00Z");
  for (const d of days) {
    const ds = d.slice(0, 10);
    const cursorStr = fmt(cursor);
    if (ds === cursorStr) {
      streak++;
      cursor = new Date(cursor.getTime() - 86_400_000);
    } else {
      break;
    }
  }
  return streak;
}

export type PersonalSummary = {
  totalAttempts: number;
  correctAttempts: number;
  bookmarkCount: number;
  streakDays: number;
};

export async function getPersonalSummary(userId: string): Promise<PersonalSummary> {
  const [statsRow, bmRow] = await Promise.all([
    db.execute(sql`
      SELECT
        COUNT(*)::int AS total,
        SUM(CASE WHEN result = 'correct' THEN 1 ELSE 0 END)::int AS correct
      FROM attempts
      WHERE user_id = ${userId} AND result IN ('correct', 'incorrect')
    `),
    db.execute(sql`SELECT COUNT(*)::int AS c FROM bookmarks WHERE user_id = ${userId}`),
  ]);
  const s = (statsRow.rows[0] ?? {}) as { total?: number; correct?: number };
  const b = (bmRow.rows[0] ?? {}) as { c?: number };
  const streak = await getStreakDays(userId);
  return {
    totalAttempts: Number(s.total ?? 0),
    correctAttempts: Number(s.correct ?? 0),
    bookmarkCount: Number(b.c ?? 0),
    streakDays: streak,
  };
}

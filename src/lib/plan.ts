import { eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { bookmarks, notes, users } from "@/db/schema";

export type Plan = "free" | "pro";

export const PLAN_LIMITS = {
  free: {
    dailyQuestionAttempts: 10,
    maxSessionCount: 5,
    maxBookmarks: 3,
    maxNotes: 0,
    mockExam: false,
    advancedAnalytics: false,
    pdfExport: false,
    unlimitedYears: false,
  },
  pro: {
    dailyQuestionAttempts: Number.POSITIVE_INFINITY,
    maxSessionCount: 100,
    maxBookmarks: Number.POSITIVE_INFINITY,
    maxNotes: Number.POSITIVE_INFINITY,
    mockExam: true,
    advancedAnalytics: true,
    pdfExport: true,
    unlimitedYears: true,
  },
} as const;

export const PRO_PRICE_JPY_MONTHLY = 780;
export const PRO_PRICE_JPY_YEARLY = 6800;

export type PlanUser = {
  id: string;
  plan: Plan;
};

export function isPro(user: Pick<PlanUser, "plan"> | null | undefined): boolean {
  return user?.plan === "pro";
}

export function limitsFor(plan: Plan) {
  return PLAN_LIMITS[plan];
}

/**
 * Count attempts (excluding skipped) the user has made since the start of
 * "today" in JST. We intentionally use JST so limits reset at a consistent
 * time for Japanese users regardless of server TZ.
 */
export async function getDailyAttemptCount(userId: string): Promise<number> {
  const row = await db.execute(sql`
    SELECT COUNT(*)::int AS c
    FROM attempts
    WHERE user_id = ${userId}
      AND result IN ('correct', 'incorrect')
      AND created_at >= date_trunc('day', (now() AT TIME ZONE 'Asia/Tokyo')) AT TIME ZONE 'Asia/Tokyo'
  `);
  return Number((row.rows[0] as { c?: number } | undefined)?.c ?? 0);
}

export async function getBookmarkCount(userId: string): Promise<number> {
  const row = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(bookmarks)
    .where(eq(bookmarks.userId, userId));
  return Number(row[0]?.c ?? 0);
}

export async function getNoteCount(userId: string): Promise<number> {
  const row = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(notes)
    .where(eq(notes.userId, userId));
  return Number(row[0]?.c ?? 0);
}

export type AttemptGate =
  | { ok: true; remaining: number | null; limit: number | null; plan: Plan }
  | { ok: false; reason: "daily_limit"; used: number; limit: number; plan: Plan };

export async function checkAttemptGate(user: PlanUser): Promise<AttemptGate> {
  const limit = limitsFor(user.plan).dailyQuestionAttempts;
  if (!Number.isFinite(limit)) {
    return { ok: true, remaining: null, limit: null, plan: user.plan };
  }
  const used = await getDailyAttemptCount(user.id);
  if (used >= limit) {
    return {
      ok: false,
      reason: "daily_limit",
      used,
      limit: limit as number,
      plan: user.plan,
    };
  }
  return {
    ok: true,
    remaining: (limit as number) - used,
    limit: limit as number,
    plan: user.plan,
  };
}

export async function setPlan(input: {
  userId: string;
  plan: Plan;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  renewsAt?: Date | null;
}) {
  await db
    .update(users)
    .set({
      plan: input.plan,
      planSince: input.plan === "pro" ? new Date() : null,
      planRenewsAt: input.renewsAt ?? null,
      stripeCustomerId: input.stripeCustomerId ?? undefined,
      stripeSubscriptionId: input.stripeSubscriptionId ?? undefined,
    })
    .where(eq(users.id, input.userId));
}


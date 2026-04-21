import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { bookmarks, notes, questions, users } from "@/db/schema";

export type Plan = "free" | "pro" | "premium";

/**
 * Source of truth for plan entitlements.
 *
 * Every gate — both server and client — MUST consult `PLAN_LIMITS` via
 * `limitsFor()` / `hasFeature()`. Do not scatter plan enums around the codebase.
 */
export const PLAN_LIMITS = {
  free: {
    dailyQuestionAttempts: 10,
    maxSessionCount: 5,
    maxBookmarks: 3,
    maxNotes: 0,
    /** How many most-recent exam years are visible. `null` = all years. */
    yearWindow: 1 as number | null,
    /** Max allowed size when creating a mock exam. 0 disables the mode. */
    mockExamMaxCount: 0,
    mockExam: false,
    advancedAnalytics: false,
    pdfExport: false,
    unlimitedYears: false,
    aiExplanations: false,
    prioritySupport: false,
    adFree: false,
  },
  pro: {
    dailyQuestionAttempts: Number.POSITIVE_INFINITY,
    maxSessionCount: 100,
    maxBookmarks: Number.POSITIVE_INFINITY,
    maxNotes: Number.POSITIVE_INFINITY,
    yearWindow: 2 as number | null,
    mockExamMaxCount: 100,
    mockExam: true,
    advancedAnalytics: true,
    pdfExport: true,
    unlimitedYears: false,
    aiExplanations: false,
    prioritySupport: false,
    adFree: true,
  },
  premium: {
    dailyQuestionAttempts: Number.POSITIVE_INFINITY,
    maxSessionCount: 200,
    maxBookmarks: Number.POSITIVE_INFINITY,
    maxNotes: Number.POSITIVE_INFINITY,
    yearWindow: null as number | null,
    mockExamMaxCount: 200,
    mockExam: true,
    advancedAnalytics: true,
    pdfExport: true,
    unlimitedYears: true,
    aiExplanations: true,
    prioritySupport: true,
    adFree: true,
  },
} as const;

export const PRO_PRICE_JPY_MONTHLY = 780;
export const PREMIUM_PRICE_JPY_MONTHLY = 1980;

/** Mock exam time limit in minutes — same for Pro and Premium. */
export const MOCK_EXAM_DURATION_MIN = 120;

export type PlanUser = {
  id: string;
  plan: Plan;
};

export function isPaid(user: Pick<PlanUser, "plan"> | null | undefined): boolean {
  return user?.plan === "pro" || user?.plan === "premium";
}

export function isPro(user: Pick<PlanUser, "plan"> | null | undefined): boolean {
  // Legacy callers: "pro or better". Premium users get Pro features for free.
  return isPaid(user);
}

export function isPremium(user: Pick<PlanUser, "plan"> | null | undefined): boolean {
  return user?.plan === "premium";
}

export function planLabel(plan: Plan): string {
  switch (plan) {
    case "premium":
      return "Premium";
    case "pro":
      return "Pro";
    default:
      return "Free";
  }
}

export function limitsFor(plan: Plan) {
  return PLAN_LIMITS[plan];
}

/** Boolean feature flags surfaced on `PLAN_LIMITS`. */
export type Feature =
  | "mockExam"
  | "advancedAnalytics"
  | "pdfExport"
  | "unlimitedYears"
  | "aiExplanations"
  | "prioritySupport"
  | "adFree";

export function hasFeature(
  user: Pick<PlanUser, "plan"> | null | undefined,
  feature: Feature
): boolean {
  const plan = user?.plan ?? "free";
  return Boolean(PLAN_LIMITS[plan][feature]);
}

/**
 * Count attempts (excluding skipped) the user has made since the start of
 * "today" in JST.
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

// ---- Year archive gating --------------------------------------------------

let latestYearCache: { at: number; year: number } | null = null;
const LATEST_YEAR_TTL_MS = 60 * 1000;

/**
 * Newest `exam_year` in the questions table. Cached for 60s — the archive
 * only changes on `pnpm seed`, so stale reads for a minute are fine and it
 * keeps per-request gate checks cheap.
 */
export async function getLatestExamYear(): Promise<number> {
  const now = Date.now();
  if (latestYearCache && now - latestYearCache.at < LATEST_YEAR_TTL_MS) {
    return latestYearCache.year;
  }
  const rows = await db
    .select({ y: questions.examYear })
    .from(questions)
    .orderBy(desc(questions.examYear))
    .limit(1);
  const year = rows[0]?.y ?? new Date().getFullYear();
  latestYearCache = { at: now, year };
  return year;
}

/**
 * Compute the oldest exam year the user is allowed to access.
 * Premium → no restriction (returns `null`).
 */
export async function minAllowedExamYear(plan: Plan): Promise<number | null> {
  const window = limitsFor(plan).yearWindow;
  if (window === null) return null;
  const latest = await getLatestExamYear();
  return latest - window + 1;
}

export async function isYearAllowed(plan: Plan, examYear: number): Promise<boolean> {
  const min = await minAllowedExamYear(plan);
  if (min === null) return true;
  return examYear >= min;
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
      planSince: input.plan !== "free" ? new Date() : null,
      planRenewsAt: input.renewsAt ?? null,
      stripeCustomerId: input.stripeCustomerId ?? undefined,
      stripeSubscriptionId: input.stripeSubscriptionId ?? undefined,
    })
    .where(eq(users.id, input.userId));
}

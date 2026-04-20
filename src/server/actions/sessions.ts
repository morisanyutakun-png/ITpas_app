"use server";

import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { sessions } from "@/db/schema";
import { getCurrentUser } from "@/lib/currentUser";
import {
  hasFeature,
  isYearAllowed,
  limitsFor,
  minAllowedExamYear,
  type Plan,
} from "@/lib/plan";
import {
  selectQuestionIds,
  type SelectorFilters,
  type SelectorMode,
} from "@/server/selection/weaknessSelector";

export type CreateSessionResult =
  | { ok: true; sessionId: string }
  | {
      ok: false;
      reason:
        | "no_questions_found"
        | "mock_exam_locked"
        | "mock_exam_size_locked"
        | "year_locked"
        | "session_size_capped";
      plan: Plan;
      detail?: string;
    };

/**
 * Create a learning session, enforcing plan limits server-side.
 *
 * Gate order (deny early, before DB writes):
 *   1. Mock exam mode → requires mockExam feature.
 *   2. Mock exam count → capped by `mockExamMaxCount` for the plan.
 *   3. Year filter    → must be within the plan's year window.
 *   4. Non-mock count → capped by `maxSessionCount`; over-requesting silently caps.
 *
 * On success we `redirect()` (Next throws internally). On gate failure we
 * return a reason so the caller can route to /pricing or surface a modal.
 */
export async function createSessionAction(input: {
  mode: SelectorMode;
  filters?: SelectorFilters;
  count?: number;
  /** Set when the caller intends a full mock exam (distinct from casual "mixed"). */
  mockExam?: boolean;
}): Promise<CreateSessionResult | void> {
  const user = await getCurrentUser();
  const limits = limitsFor(user.plan);
  const requested = input.count ?? 5;

  const isMockExam = Boolean(input.mockExam) || (input.mode === "mixed" && requested >= 50);

  if (isMockExam) {
    if (!hasFeature(user, "mockExam")) {
      return { ok: false, reason: "mock_exam_locked", plan: user.plan };
    }
    if (requested > limits.mockExamMaxCount) {
      return {
        ok: false,
        reason: "mock_exam_size_locked",
        plan: user.plan,
        detail: `${limits.mockExamMaxCount}問まで`,
      };
    }
  }

  if (input.filters?.examYear !== undefined) {
    const allowed = await isYearAllowed(user.plan, input.filters.examYear);
    if (!allowed) {
      return {
        ok: false,
        reason: "year_locked",
        plan: user.plan,
        detail: String(input.filters.examYear),
      };
    }
  }

  const cap = isMockExam ? limits.mockExamMaxCount : limits.maxSessionCount;
  const effectiveCount = Math.min(requested, cap);

  // Hide locked years from the pool at selection time so mock exams don't
  // include content the user isn't entitled to see.
  const minYear = await minAllowedExamYear(user.plan);
  const ids = await selectQuestionIds({
    userId: user.id,
    mode: input.mode,
    filters: input.filters,
    count: effectiveCount,
    minYear,
  });

  if (ids.length === 0) {
    return { ok: false, reason: "no_questions_found", plan: user.plan };
  }

  const inserted = await db
    .insert(sessions)
    .values({
      userId: user.id,
      mode: input.mode,
      filters: {
        ...(input.filters ?? {}),
        mockExam: isMockExam || undefined,
      },
      questionIds: ids,
      totalCount: ids.length,
    })
    .returning({ id: sessions.id });

  redirect(`/learn/session/${inserted[0].id}`);
}

export async function finishSessionAction(sessionId: string) {
  const user = await getCurrentUser();
  const s = await db.query.sessions.findFirst({
    where: eq(sessions.id, sessionId),
  });
  if (!s || s.userId !== user.id) return;

  const correctRow = await db.execute(sql`
    SELECT COUNT(*)::int AS c
    FROM attempts
    WHERE session_id = ${sessionId} AND result = 'correct'
  `);
  const correctCount = Number(
    (correctRow.rows[0] as { c?: number } | undefined)?.c ?? 0
  );

  await db
    .update(sessions)
    .set({
      finishedAt: new Date(),
      correctCount,
    })
    .where(eq(sessions.id, sessionId));
}

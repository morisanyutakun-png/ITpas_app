"use server";

import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { attempts, sessions } from "@/db/schema";
import { getOrCreateAnonUser } from "@/lib/anonId";
import {
  selectQuestionIds,
  type SelectorFilters,
  type SelectorMode,
} from "@/server/selection/weaknessSelector";

export async function createSessionAction(input: {
  mode: SelectorMode;
  filters?: SelectorFilters;
  count?: number;
}) {
  const user = await getOrCreateAnonUser();
  const ids = await selectQuestionIds({
    userId: user.id,
    mode: input.mode,
    filters: input.filters,
    count: input.count ?? 5,
  });

  if (ids.length === 0) {
    return { ok: false as const, error: "no_questions_found" };
  }

  const inserted = await db
    .insert(sessions)
    .values({
      userId: user.id,
      mode: input.mode,
      filters: input.filters ?? {},
      questionIds: ids,
      totalCount: ids.length,
    })
    .returning({ id: sessions.id });

  redirect(`/learn/session/${inserted[0].id}`);
}

export async function finishSessionAction(sessionId: string) {
  const user = await getOrCreateAnonUser();
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

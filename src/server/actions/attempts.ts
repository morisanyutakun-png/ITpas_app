"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { attempts } from "@/db/schema";
import { getCurrentUser } from "@/lib/currentUser";
import { checkAttemptGate, type Plan } from "@/lib/plan";

export type RecordAttemptResult =
  | { ok: true; remaining: number | null }
  | {
      ok: false;
      reason: "daily_limit";
      used: number;
      limit: number;
      plan: Plan;
    };

export async function recordAttemptAction(input: {
  questionId: string;
  selectedChoiceLabel: string | null;
  result: "correct" | "incorrect" | "skipped";
  durationMs: number;
  sessionId?: string;
}): Promise<RecordAttemptResult> {
  const user = await getCurrentUser();

  // Skipped attempts do not count toward the freemium cap.
  if (input.result !== "skipped") {
    const gate = await checkAttemptGate({ id: user.id, plan: user.plan });
    if (!gate.ok) {
      return {
        ok: false,
        reason: "daily_limit",
        used: gate.used,
        limit: gate.limit,
        plan: gate.plan,
      };
    }
  }

  await db.insert(attempts).values({
    userId: user.id,
    questionId: input.questionId,
    selectedChoiceLabel: input.selectedChoiceLabel,
    result: input.result,
    durationMs: input.durationMs,
    sessionId: input.sessionId ?? null,
  });

  revalidatePath("/dashboard");

  const after = await checkAttemptGate({ id: user.id, plan: user.plan });
  return { ok: true, remaining: after.ok ? after.remaining : 0 };
}

"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { attempts } from "@/db/schema";
import { getOrCreateAnonUser } from "@/lib/anonId";

export async function recordAttemptAction(input: {
  questionId: string;
  selectedChoiceLabel: string | null;
  result: "correct" | "incorrect" | "skipped";
  durationMs: number;
  sessionId?: string;
}) {
  const user = await getOrCreateAnonUser();
  await db.insert(attempts).values({
    userId: user.id,
    questionId: input.questionId,
    selectedChoiceLabel: input.selectedChoiceLabel,
    result: input.result,
    durationMs: input.durationMs,
    sessionId: input.sessionId ?? null,
  });
  revalidatePath("/dashboard");
  return { ok: true };
}

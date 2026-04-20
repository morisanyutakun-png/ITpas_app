"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { notes } from "@/db/schema";
import { getCurrentUser } from "@/lib/currentUser";
import { isPro } from "@/lib/plan";

export type SaveNoteResult =
  | { ok: true; saved: boolean }
  | { ok: false; reason: "pro_only" | "not_signed_in" };

export async function saveNoteAction(input: {
  questionId: string;
  body: string;
}): Promise<SaveNoteResult> {
  const user = await getCurrentUser();
  if (!user.isSignedIn) return { ok: false, reason: "not_signed_in" };
  if (!isPro(user)) return { ok: false, reason: "pro_only" };

  const trimmed = input.body.trim();

  const existing = await db.query.notes.findFirst({
    where: and(eq(notes.userId, user.id), eq(notes.questionId, input.questionId)),
  });

  if (!trimmed) {
    if (existing) await db.delete(notes).where(eq(notes.id, existing.id));
    revalidatePath(`/learn/questions/${input.questionId}`);
    return { ok: true, saved: false };
  }

  if (existing) {
    await db
      .update(notes)
      .set({ body: trimmed, updatedAt: new Date() })
      .where(eq(notes.id, existing.id));
  } else {
    await db.insert(notes).values({
      userId: user.id,
      questionId: input.questionId,
      body: trimmed,
    });
  }
  revalidatePath(`/learn/questions/${input.questionId}`);
  return { ok: true, saved: true };
}

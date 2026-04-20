"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { bookmarks } from "@/db/schema";
import { getCurrentUser } from "@/lib/currentUser";
import { getBookmarkCount, limitsFor } from "@/lib/plan";

export type BookmarkResult =
  | { ok: true; bookmarked: boolean; count: number }
  | { ok: false; reason: "bookmark_limit"; limit: number; count: number };

export async function toggleBookmarkAction(input: {
  questionId: string;
}): Promise<BookmarkResult> {
  const user = await getCurrentUser();

  const existing = await db.query.bookmarks.findFirst({
    where: and(
      eq(bookmarks.userId, user.id),
      eq(bookmarks.questionId, input.questionId)
    ),
  });

  if (existing) {
    await db.delete(bookmarks).where(eq(bookmarks.id, existing.id));
    revalidatePath("/bookmarks");
    revalidatePath(`/learn/questions/${input.questionId}`);
    const count = await getBookmarkCount(user.id);
    return { ok: true, bookmarked: false, count };
  }

  // Cap check before inserting.
  const limit = limitsFor(user.plan).maxBookmarks;
  if (Number.isFinite(limit)) {
    const count = await getBookmarkCount(user.id);
    if (count >= limit) {
      return {
        ok: false,
        reason: "bookmark_limit",
        limit: limit as number,
        count,
      };
    }
  }

  await db.insert(bookmarks).values({
    userId: user.id,
    questionId: input.questionId,
  });
  revalidatePath("/bookmarks");
  revalidatePath(`/learn/questions/${input.questionId}`);
  const count = await getBookmarkCount(user.id);
  return { ok: true, bookmarked: true, count };
}

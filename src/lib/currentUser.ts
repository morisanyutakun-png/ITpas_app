import { cookies } from "next/headers";
import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { attempts, bookmarks, notes, sessions, users } from "@/db/schema";
import { readSessionCookie, signSession } from "@/lib/session";
import type { Plan } from "@/lib/plan";

export const ANON_COOKIE = "itpas_anon_key";
const ANON_MAX_AGE = 60 * 60 * 24 * 365 * 2;

export type CurrentUser = {
  id: string;
  plan: Plan;
  googleId: string | null;
  email: string | null;
  displayName: string | null;
  imageUrl: string | null;
  isSignedIn: boolean;
};

function anonKey(): string {
  return crypto.randomUUID();
}

async function ensureAnonUser(): Promise<CurrentUser> {
  const jar = await cookies();
  let key = jar.get(ANON_COOKIE)?.value;
  if (!key) {
    key = anonKey();
    jar.set(ANON_COOKIE, key, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: ANON_MAX_AGE,
      path: "/",
    });
  }

  const existing = await db.query.users.findFirst({
    where: eq(users.anonKey, key),
  });
  if (existing) return toCurrent(existing);

  const inserted = await db
    .insert(users)
    .values({ anonKey: key })
    .onConflictDoNothing({ target: users.anonKey })
    .returning();
  if (inserted[0]) return toCurrent(inserted[0]);

  const again = await db.query.users.findFirst({
    where: eq(users.anonKey, key),
  });
  if (!again) throw new Error("Failed to create anon user");
  return toCurrent(again);
}

function toCurrent(row: typeof users.$inferSelect): CurrentUser {
  return {
    id: row.id,
    plan: row.plan,
    googleId: row.googleId,
    email: row.email,
    displayName: row.displayName,
    imageUrl: row.imageUrl,
    isSignedIn: !!row.googleId,
  };
}

/**
 * Resolve the current user:
 *   signed-in session cookie → users row (by google_id)
 *   else anonymous cookie → users row (by anon_key), creating one if needed
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  const sess = await readSessionCookie();
  if (sess) {
    const row = await db.query.users.findFirst({
      where: eq(users.id, sess.uid),
    });
    if (row) return toCurrent(row);
    // Stale session — fall through to anon bootstrap.
  }
  return ensureAnonUser();
}

/** Lighter variant that does NOT create an anon row. Use in layouts. */
export async function readCurrentUser(): Promise<CurrentUser | null> {
  const sess = await readSessionCookie();
  if (sess) {
    const row = await db.query.users.findFirst({
      where: eq(users.id, sess.uid),
    });
    if (row) return toCurrent(row);
  }
  const jar = await cookies();
  const key = jar.get(ANON_COOKIE)?.value;
  if (!key) return null;
  const row = await db.query.users.findFirst({
    where: eq(users.anonKey, key),
  });
  return row ? toCurrent(row) : null;
}

/**
 * Sign in with Google. Creates or updates the users row keyed by google_id.
 * If an anon row exists for this browser, its attempts/sessions/bookmarks/notes
 * are merged into the Google-linked row so signup does not erase progress.
 *
 * Returns the signed session token — the caller is responsible for setting it
 * on the outgoing response (e.g. NextResponse.cookies.set). We don't set it
 * here because cookie mutations via `cookies()` don't reliably propagate to
 * `NextResponse.redirect()` responses in Next.js 15.
 */
export async function signInWithGoogle(input: {
  sub: string;
  email: string;
  name?: string;
  image?: string;
  anonKeyFromCookie: string | null;
}): Promise<{ user: CurrentUser; sessionToken: string }> {
  const anon = input.anonKeyFromCookie;

  const existingByGoogle = await db.query.users.findFirst({
    where: eq(users.googleId, input.sub),
  });

  let userRow: typeof users.$inferSelect;

  if (existingByGoogle) {
    const updated = await db
      .update(users)
      .set({
        email: input.email,
        displayName: input.name ?? existingByGoogle.displayName,
        imageUrl: input.image ?? existingByGoogle.imageUrl,
      })
      .where(eq(users.id, existingByGoogle.id))
      .returning();
    userRow = updated[0];

    // Merge anon row (if any) into the existing Google user.
    if (anon) {
      const anonRow = await db.query.users.findFirst({
        where: and(eq(users.anonKey, anon), isNull(users.googleId)),
      });
      if (anonRow && anonRow.id !== userRow.id) {
        await mergeUser(anonRow.id, userRow.id);
      }
    }
  } else if (anon) {
    // Promote the anon row to a Google-linked row (preserving all data).
    const anonRow = await db.query.users.findFirst({
      where: and(eq(users.anonKey, anon), isNull(users.googleId)),
    });
    if (anonRow) {
      const updated = await db
        .update(users)
        .set({
          googleId: input.sub,
          email: input.email,
          displayName: input.name,
          imageUrl: input.image,
          anonKey: null,
        })
        .where(eq(users.id, anonRow.id))
        .returning();
      userRow = updated[0];
    } else {
      const inserted = await db
        .insert(users)
        .values({
          googleId: input.sub,
          email: input.email,
          displayName: input.name,
          imageUrl: input.image,
        })
        .returning();
      userRow = inserted[0];
    }
  } else {
    const inserted = await db
      .insert(users)
      .values({
        googleId: input.sub,
        email: input.email,
        displayName: input.name,
        imageUrl: input.image,
      })
      .returning();
    userRow = inserted[0];
  }

  const sessionToken = await signSession({
    uid: userRow.id,
    sub: input.sub,
    email: input.email,
    name: input.name,
    image: input.image,
  });

  return { user: toCurrent(userRow), sessionToken };
}

async function mergeUser(fromUserId: string, toUserId: string) {
  // Reassign all child rows, then delete the source user.
  await db
    .update(attempts)
    .set({ userId: toUserId })
    .where(eq(attempts.userId, fromUserId));
  await db
    .update(sessions)
    .set({ userId: toUserId })
    .where(eq(sessions.userId, fromUserId));

  // Bookmarks / notes: avoid duplicate-key conflicts by deleting collisions first.
  await db.execute(sql`
    DELETE FROM bookmarks
    WHERE user_id = ${fromUserId}
      AND question_id IN (
        SELECT question_id FROM bookmarks WHERE user_id = ${toUserId}
      )
  `);
  await db
    .update(bookmarks)
    .set({ userId: toUserId })
    .where(eq(bookmarks.userId, fromUserId));

  await db.execute(sql`
    DELETE FROM notes
    WHERE user_id = ${fromUserId}
      AND question_id IN (
        SELECT question_id FROM notes WHERE user_id = ${toUserId}
      )
  `);
  await db
    .update(notes)
    .set({ userId: toUserId })
    .where(eq(notes.userId, fromUserId));

  await db.delete(users).where(eq(users.id, fromUserId));
}

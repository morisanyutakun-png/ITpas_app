import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";

const COOKIE_NAME = "itpas_anon_key";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 * 2; // 2 years

function newAnonKey(): string {
  // Web-standard randomUUID is available on both Edge and Node 19+ runtimes.
  return crypto.randomUUID();
}

/**
 * Look up or create an anonymous user from the request cookie.
 * Sets the cookie if not present.
 */
export async function getOrCreateAnonUser() {
  const jar = await cookies();
  let anonKey = jar.get(COOKIE_NAME)?.value;

  if (!anonKey) {
    anonKey = newAnonKey();
    jar.set(COOKIE_NAME, anonKey, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
  }

  const existing = await db.query.users.findFirst({
    where: eq(users.anonKey, anonKey),
  });
  if (existing) return existing;

  const inserted = await db
    .insert(users)
    .values({ anonKey })
    .onConflictDoNothing({ target: users.anonKey })
    .returning();

  if (inserted[0]) return inserted[0];

  // Race fallback
  const again = await db.query.users.findFirst({
    where: eq(users.anonKey, anonKey),
  });
  if (!again) throw new Error("Failed to create anon user");
  return again;
}

import { cookies } from "next/headers";

export const SESSION_COOKIE = "itpas_session";
export const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 days

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SEC,
    path: "/",
  };
}

export type SessionPayload = {
  uid: string;        // users.id
  sub: string;        // Google sub (stable account id)
  email: string;
  name?: string;
  image?: string;
  iat: number;        // issued-at (sec)
  exp: number;        // expires-at (sec)
};

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    throw new Error(
      "AUTH_SECRET must be set to a random string >=32 chars. See .env.example."
    );
  }
  return s;
}

function toB64Url(bytes: Uint8Array | ArrayBuffer): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = "";
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64Url(s: string): Uint8Array<ArrayBuffer> {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const buf = new ArrayBuffer(bin.length);
  const arr = new Uint8Array(buf);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

function utf8(s: string): Uint8Array<ArrayBuffer> {
  const encoded = new TextEncoder().encode(s);
  const buf = new ArrayBuffer(encoded.byteLength);
  const arr = new Uint8Array(buf);
  arr.set(encoded);
  return arr;
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    utf8(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signSession(
  payload: Omit<SessionPayload, "iat" | "exp">
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const body: SessionPayload = {
    ...payload,
    iat: now,
    exp: now + SESSION_MAX_AGE_SEC,
  };
  const bodyB64 = toB64Url(utf8(JSON.stringify(body)));
  const sig = await crypto.subtle.sign(
    "HMAC",
    await hmacKey(),
    utf8(bodyB64)
  );
  return `${bodyB64}.${toB64Url(sig)}`;
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [bodyB64, sigB64] = parts;
  const ok = await crypto.subtle.verify(
    "HMAC",
    await hmacKey(),
    fromB64Url(sigB64),
    utf8(bodyB64)
  );
  if (!ok) return null;
  try {
    const parsed = JSON.parse(
      new TextDecoder().decode(fromB64Url(bodyB64))
    ) as SessionPayload;
    if (parsed.exp < Math.floor(Date.now() / 1000)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, sessionCookieOptions());
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function readSessionCookie(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  return verifySession(raw);
}

const OAUTH_STATE_COOKIE = "itpas_oauth_state";
const OAUTH_STATE_MAX_AGE = 60 * 10; // 10 min

export async function setOAuthStateCookie(state: string) {
  const jar = await cookies();
  jar.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: OAUTH_STATE_MAX_AGE,
    path: "/",
  });
}

export async function consumeOAuthStateCookie(): Promise<string | null> {
  const jar = await cookies();
  const v = jar.get(OAUTH_STATE_COOKIE)?.value ?? null;
  jar.delete(OAUTH_STATE_COOKIE);
  return v;
}

import { NextResponse, type NextRequest } from "next/server";
import {
  exchangeCodeForUser,
  googleRedirectUri,
} from "@/lib/googleAuth";
import {
  OAUTH_STATE_COOKIE,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/session";
import { ANON_COOKIE, signInWithGoogle } from "@/lib/currentUser";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeReturnTo(raw: string | undefined): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/home";
  // Don't send sign-in callbacks back to the public LP.
  if (raw === "/") return "/home";
  return raw;
}

function errorRedirect(origin: string, code: string) {
  return NextResponse.redirect(
    new URL(`/?auth_error=${encodeURIComponent(code)}`, origin)
  );
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) return errorRedirect(url.origin, error);
  if (!code || !state) return errorRedirect(url.origin, "missing_code");

  // Read the state cookie from the incoming request directly. `cookies()` in
  // Route Handlers is async and its mutations don't always round-trip through
  // NextResponse.redirect() — reading via `req.cookies` is the reliable path.
  const savedState = req.cookies.get(OAUTH_STATE_COOKIE)?.value ?? null;
  if (!savedState || savedState !== state) {
    return errorRedirect(url.origin, "state_mismatch");
  }

  let returnTo = "/home";
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString("utf8")) as {
      r?: string;
    };
    returnTo = safeReturnTo(decoded.r);
  } catch {
    /* fall through with default */
  }

  try {
    const info = await exchangeCodeForUser({
      code,
      redirectUri: googleRedirectUri(url.origin),
    });
    if (!info.email) return errorRedirect(url.origin, "no_email");

    const anonKeyFromCookie = req.cookies.get(ANON_COOKIE)?.value ?? null;

    const { sessionToken } = await signInWithGoogle({
      sub: info.sub,
      email: info.email,
      name: info.name,
      image: info.picture,
      anonKeyFromCookie,
    });

    const res = NextResponse.redirect(new URL(returnTo, url.origin));
    res.cookies.set(SESSION_COOKIE, sessionToken, sessionCookieOptions());
    res.cookies.set(ANON_COOKIE, "", { path: "/", maxAge: 0 });
    res.cookies.set(OAUTH_STATE_COOKIE, "", { path: "/", maxAge: 0 });
    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    console.error("google oauth callback error", e);
    return errorRedirect(url.origin, msg);
  }
}

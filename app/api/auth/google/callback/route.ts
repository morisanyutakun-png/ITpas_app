import { NextResponse, type NextRequest } from "next/server";
import {
  exchangeCodeForUser,
  googleRedirectUri,
} from "@/lib/googleAuth";
import {
  consumeOAuthStateCookie,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/session";
import { ANON_COOKIE, signInWithGoogle } from "@/lib/currentUser";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeReturnTo(raw: string | undefined): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/?auth_error=${encodeURIComponent(error)}`, url.origin)
    );
  }
  if (!code || !state) {
    return NextResponse.redirect(new URL("/?auth_error=missing_code", url.origin));
  }

  const saved = await consumeOAuthStateCookie();
  if (!saved || saved !== state) {
    return NextResponse.redirect(new URL("/?auth_error=state_mismatch", url.origin));
  }

  let returnTo = "/";
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
    if (!info.email) {
      return NextResponse.redirect(
        new URL("/?auth_error=no_email", url.origin)
      );
    }

    const anonKeyFromCookie = req.cookies.get(ANON_COOKIE)?.value ?? null;

    const { sessionToken } = await signInWithGoogle({
      sub: info.sub,
      email: info.email,
      name: info.name,
      image: info.picture,
      anonKeyFromCookie,
    });

    // Cookie mutations on the NextResponse directly — this is the only form
    // Next.js reliably serializes into a redirect response.
    const res = NextResponse.redirect(new URL(returnTo, url.origin));
    res.cookies.set(SESSION_COOKIE, sessionToken, sessionCookieOptions());
    res.cookies.set(ANON_COOKIE, "", { path: "/", maxAge: 0 });
    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.redirect(
      new URL(`/?auth_error=${encodeURIComponent(msg)}`, url.origin)
    );
  }
}

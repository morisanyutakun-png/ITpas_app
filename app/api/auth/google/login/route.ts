import { NextResponse, type NextRequest } from "next/server";
import {
  buildAuthorizeUrl,
  googleRedirectUri,
} from "@/lib/googleAuth";
import {
  OAUTH_STATE_COOKIE,
  oauthStateCookieOptions,
} from "@/lib/session";
import { readCurrentUser } from "@/lib/currentUser";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeReturn(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/home";
  return raw;
}

export async function GET(req: NextRequest) {
  const origin = new URL(req.url).origin;
  const returnTo = safeReturn(req.nextUrl.searchParams.get("returnTo"));

  // If the user already has a signed-in session, skip the Google chooser
  // entirely and forward them to `returnTo`. This is what makes the LP
  // checkout shortcut feel instant for returning users.
  const existing = await readCurrentUser();
  if (existing?.isSignedIn) {
    return NextResponse.redirect(new URL(returnTo, origin));
  }

  const stateObj = { n: crypto.randomUUID(), r: returnTo };
  const state = Buffer.from(JSON.stringify(stateObj)).toString("base64url");

  let authorizeUrl: string;
  try {
    authorizeUrl = buildAuthorizeUrl({
      redirectUri: googleRedirectUri(origin),
      state,
    });
  } catch (e) {
    // Surface misconfiguration (missing client id/secret) instead of silently 500-ing.
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.redirect(
      new URL(`/?auth_error=${encodeURIComponent(msg)}`, origin)
    );
  }

  const res = NextResponse.redirect(authorizeUrl);
  res.cookies.set(OAUTH_STATE_COOKIE, state, oauthStateCookieOptions());
  return res;
}


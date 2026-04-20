import { NextResponse, type NextRequest } from "next/server";
import {
  buildAuthorizeUrl,
  googleRedirectUri,
} from "@/lib/googleAuth";
import {
  OAUTH_STATE_COOKIE,
  oauthStateCookieOptions,
} from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const origin = new URL(req.url).origin;
  const returnTo = req.nextUrl.searchParams.get("returnTo") ?? "/";
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

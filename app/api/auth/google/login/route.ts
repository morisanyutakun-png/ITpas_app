import { NextResponse, type NextRequest } from "next/server";
import {
  buildAuthorizeUrl,
  googleRedirectUri,
} from "@/lib/googleAuth";
import { setOAuthStateCookie } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const origin = new URL(req.url).origin;
  const returnTo = req.nextUrl.searchParams.get("returnTo") ?? "/";
  const stateObj = { n: crypto.randomUUID(), r: returnTo };
  const state = Buffer.from(JSON.stringify(stateObj)).toString("base64url");
  await setOAuthStateCookie(state);

  const url = buildAuthorizeUrl({
    redirectUri: googleRedirectUri(origin),
    state,
  });
  return NextResponse.redirect(url);
}

import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clear(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}

export async function GET(req: NextRequest) {
  return clear(NextResponse.redirect(new URL("/", req.url)));
}

export async function POST(req: NextRequest) {
  return clear(NextResponse.redirect(new URL("/", req.url), { status: 303 }));
}

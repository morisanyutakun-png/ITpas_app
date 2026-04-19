import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { sessions } from "@/db/schema";
import { getOrCreateAnonUser } from "@/lib/anonId";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getOrCreateAnonUser();
  const s = await db.query.sessions.findFirst({ where: eq(sessions.id, id) });
  if (!s || s.userId !== user.id) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const ids = (s.questionIds as unknown as string[]) ?? [];
  return NextResponse.json({ questionIds: ids, totalCount: s.totalCount });
}

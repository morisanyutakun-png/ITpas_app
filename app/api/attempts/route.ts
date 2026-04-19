import { NextResponse } from "next/server";
import { recordAttemptAction } from "@/server/actions/attempts";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    questionId: string;
    selectedChoiceLabel: string | null;
    result: "correct" | "incorrect" | "skipped";
    durationMs: number;
    sessionId?: string;
  };
  const out = await recordAttemptAction(body);
  return NextResponse.json(out);
}

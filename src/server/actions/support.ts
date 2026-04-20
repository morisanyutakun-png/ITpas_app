"use server";

import { getCurrentUser } from "@/lib/currentUser";
import { hasFeature, type Plan } from "@/lib/plan";

export type SupportResult =
  | { ok: true }
  | {
      ok: false;
      reason: "not_signed_in" | "premium_only" | "empty" | "too_long";
      plan: Plan;
    };

/**
 * Premium-only support ticket. We don't persist to a DB table here — the
 * team reads these from the server log and replies via email within 24h,
 * matching the pricing page commitment ("優先サポート (メール・24h以内返信)").
 *
 * If we later want a UI for the team, add a `support_tickets` table and
 * swap the console path for a DB insert.
 */
export async function submitSupportAction(formData: FormData): Promise<SupportResult> {
  const user = await getCurrentUser();
  if (!user.isSignedIn) {
    return { ok: false, reason: "not_signed_in", plan: user.plan };
  }
  if (!hasFeature(user, "prioritySupport")) {
    return { ok: false, reason: "premium_only", plan: user.plan };
  }

  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!subject || !message) {
    return { ok: false, reason: "empty", plan: user.plan };
  }
  if (subject.length > 200 || message.length > 4000) {
    return { ok: false, reason: "too_long", plan: user.plan };
  }

  console.log("[priority_support]", {
    userId: user.id,
    email: user.email,
    displayName: user.displayName,
    subject,
    messagePreview: message.slice(0, 500),
    submittedAt: new Date().toISOString(),
  });

  return { ok: true };
}

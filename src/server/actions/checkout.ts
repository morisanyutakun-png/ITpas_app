"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/currentUser";
import { createBillingPortalSession } from "@/lib/stripe";

async function siteOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

// Checkout entry now lives at GET /api/checkout/start. Server actions used
// to handle this, but the LP needs a single-hop flow (sign in → Stripe)
// without a server-action POST round-trip, so the new route owns it.

export async function openBillingPortalAction(formData: FormData): Promise<void> {
  void formData;
  const user = await getCurrentUser();
  if (!user.isSignedIn) {
    redirect("/api/auth/google/login?returnTo=/account");
  }
  const row = await db.query.users.findFirst({ where: eq(users.id, user.id) });
  if (!row?.stripeCustomerId) {
    redirect("/account?portal=no_customer");
  }
  const origin = await siteOrigin();
  const portal = await createBillingPortalSession({
    customerId: row.stripeCustomerId,
    returnUrl: `${origin}/account`,
  });
  redirect(portal.url);
}

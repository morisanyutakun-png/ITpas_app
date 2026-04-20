"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/currentUser";
import {
  createCheckoutSession,
  createBillingPortalSession,
  stripeConfig,
  stripeConfigured,
} from "@/lib/stripe";

async function siteOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function startCheckoutAction(formData: FormData) {
  const interval = formData.get("interval") === "year" ? "year" : "month";
  const user = await getCurrentUser();
  if (!user.isSignedIn || !user.email) {
    redirect(`/api/auth/google/login?returnTo=${encodeURIComponent("/pricing")}`);
  }
  if (!stripeConfigured()) {
    redirect("/pricing?stripe=unconfigured");
  }
  const { priceMonthly, priceYearly } = stripeConfig();
  const priceId = interval === "year" ? priceYearly : priceMonthly;
  if (!priceId) {
    redirect(`/pricing?stripe=missing_${interval}`);
  }

  const origin = await siteOrigin();
  const session = await createCheckoutSession({
    priceId,
    customerEmail: user.email,
    clientReferenceId: user.id,
    successUrl: `${origin}/account?upgraded=1`,
    cancelUrl: `${origin}/pricing?canceled=1`,
  });
  redirect(session.url);
}

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

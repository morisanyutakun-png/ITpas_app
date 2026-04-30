import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/currentUser";
import {
  createCheckoutSession,
  priceIdFor,
  stripeConfigured,
  type StripeTier,
} from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET-friendly Stripe Checkout entrypoint.
 *
 * Designed so the LP can shortcut the full sequence — pricing tile click →
 * Google sign-in → land on /pricing → click upgrade — into a single hop.
 * The pricing tile / LP CTA points users at:
 *
 *     /api/auth/google/login?returnTo=/api/checkout/start?tier=pro
 *
 * After the OAuth callback restores the session it issues a redirect to the
 * `returnTo` URL, which lands here. We resolve the user, create a Stripe
 * Checkout Session, and 303 to its `url`. End result: choose plan → Google
 * account chooser → Stripe — no dead intermediate pages.
 *
 * If the user is already signed in, hitting this URL directly works too.
 * If they hit it signed out (e.g. a deep link), we bounce them through
 * Google sign-in with `returnTo` set to this same URL so they come back.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const tierRaw = url.searchParams.get("tier");
  const tier: StripeTier = tierRaw === "premium" ? "premium" : "pro";

  const user = await getCurrentUser();
  if (!user.isSignedIn || !user.email) {
    // Bounce through Google login, then come back here.
    const returnTo = `/api/checkout/start?tier=${tier}`;
    const loginUrl = new URL("/api/auth/google/login", url.origin);
    loginUrl.searchParams.set("returnTo", returnTo);
    return NextResponse.redirect(loginUrl);
  }

  if (!stripeConfigured()) {
    return NextResponse.redirect(
      new URL("/pricing?stripe=unconfigured", url.origin)
    );
  }
  const priceId = priceIdFor(tier);
  if (!priceId) {
    return NextResponse.redirect(
      new URL(`/pricing?stripe=missing_${tier}`, url.origin)
    );
  }

  try {
    const session = await createCheckoutSession({
      priceId,
      customerEmail: user.email,
      clientReferenceId: user.id,
      successUrl: `${url.origin}/account?upgraded=${tier}`,
      cancelUrl: `${url.origin}/pricing?canceled=1`,
    });
    return NextResponse.redirect(session.url, { status: 303 });
  } catch (err) {
    console.error("checkout start failed", err);
    return NextResponse.redirect(
      new URL("/pricing?stripe=session_failed", url.origin)
    );
  }
}

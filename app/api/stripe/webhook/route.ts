import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { setPlan } from "@/lib/plan";
import { planFromPriceId, retrieveSubscription } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe webhook.
 *
 * Verifying the signature is recommended. For simplicity we do it manually
 * (HMAC-SHA256 over `{timestamp}.{payload}` with STRIPE_WEBHOOK_SECRET as key)
 * to avoid adding the `stripe` SDK. If STRIPE_WEBHOOK_SECRET is not set,
 * verification is skipped — DO NOT deploy to production without it.
 */
export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sigHeader = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (secret) {
    const ok = await verifyStripeSignature(payload, sigHeader, secret);
    if (!ok) return new NextResponse("invalid signature", { status: 400 });
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(payload) as StripeEvent;
  } catch {
    return new NextResponse("invalid json", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const obj = event.data.object as CheckoutSessionObject;
        const userId = obj.client_reference_id;
        if (userId && obj.subscription) {
          // Look up the subscription to find which price (tier) was purchased.
          try {
            const sub = await retrieveSubscription(obj.subscription);
            const priceId = sub.items.data[0]?.price.id;
            const tier = planFromPriceId(priceId) ?? "pro";
            await setPlan({
              userId,
              plan: tier,
              stripeCustomerId: obj.customer ?? null,
              stripeSubscriptionId: obj.subscription,
              renewsAt: sub.current_period_end
                ? new Date(sub.current_period_end * 1000)
                : null,
            });
          } catch (e) {
            console.error("retrieveSubscription failed, defaulting to pro", e);
            await setPlan({
              userId,
              plan: "pro",
              stripeCustomerId: obj.customer ?? null,
              stripeSubscriptionId: obj.subscription,
            });
          }
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const obj = event.data.object as SubscriptionObject;
        await updatePlanBySubscription(obj);
        break;
      }
      case "customer.subscription.deleted": {
        const obj = event.data.object as SubscriptionObject;
        const row = await db.query.users.findFirst({
          where: eq(users.stripeSubscriptionId, obj.id),
        });
        if (row) {
          await setPlan({ userId: row.id, plan: "free" });
        }
        break;
      }
    }
  } catch (e) {
    console.error("stripe webhook handler error", e);
    return new NextResponse("handler error", { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function updatePlanBySubscription(sub: SubscriptionObject) {
  const row = sub.id
    ? await db.query.users.findFirst({
        where: eq(users.stripeSubscriptionId, sub.id),
      })
    : null;
  if (!row) return;
  const active = sub.status === "active" || sub.status === "trialing";

  let tier: "pro" | "premium" | null = null;
  const priceId = sub.items?.data?.[0]?.price?.id;
  tier = planFromPriceId(priceId);

  await setPlan({
    userId: row.id,
    plan: active ? tier ?? "pro" : "free",
    renewsAt: sub.current_period_end
      ? new Date(sub.current_period_end * 1000)
      : null,
  });
}

// ---- Minimal Stripe signature verification ----

async function verifyStripeSignature(
  payload: string,
  header: string | null,
  secret: string
): Promise<boolean> {
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(",").map((p) => p.split("=").map((s) => s.trim()))
  );
  const ts = parts["t"];
  const v1 = parts["v1"];
  if (!ts || !v1) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${ts}.${payload}`)
  );
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hex === v1;
}

// ---- Narrow subset of Stripe API types we care about ----

type StripeEvent = {
  type: string;
  data: { object: unknown };
};

type CheckoutSessionObject = {
  client_reference_id?: string;
  customer?: string;
  subscription?: string;
};

type SubscriptionObject = {
  id: string;
  status: string;
  current_period_end?: number;
  items?: { data: Array<{ price: { id: string } }> };
};

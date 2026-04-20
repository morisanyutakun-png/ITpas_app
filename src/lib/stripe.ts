// Minimal Stripe helpers using fetch — avoids pulling in the full `stripe` SDK.

const STRIPE_API = "https://api.stripe.com/v1";

export type StripeInterval = "month" | "year";
export type StripeTier = "pro" | "premium";

export function stripeConfig() {
  return {
    secret: process.env.STRIPE_SECRET_KEY,
    prices: {
      pro: {
        month: process.env.STRIPE_PRICE_PRO_MONTHLY,
        year: process.env.STRIPE_PRICE_PRO_YEARLY,
      },
      premium: {
        month: process.env.STRIPE_PRICE_PREMIUM_MONTHLY,
        year: process.env.STRIPE_PRICE_PREMIUM_YEARLY,
      },
    },
  };
}

export function stripeConfigured(): boolean {
  const c = stripeConfig();
  if (!c.secret) return false;
  return Boolean(
    c.prices.pro.month ||
      c.prices.pro.year ||
      c.prices.premium.month ||
      c.prices.premium.year
  );
}

export function priceIdFor(tier: StripeTier, interval: StripeInterval): string | undefined {
  return stripeConfig().prices[tier][interval];
}

export function planFromPriceId(priceId: string | undefined | null): StripeTier | null {
  if (!priceId) return null;
  const c = stripeConfig();
  if (priceId === c.prices.premium.month || priceId === c.prices.premium.year) {
    return "premium";
  }
  if (priceId === c.prices.pro.month || priceId === c.prices.pro.year) {
    return "pro";
  }
  return null;
}

function form(obj: Record<string, string | undefined>) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) p.append(k, v);
  }
  return p;
}

async function stripeFetch<T>(
  path: string,
  body: URLSearchParams
): Promise<T> {
  const { secret } = stripeConfig();
  if (!secret) throw new Error("STRIPE_SECRET_KEY not set");
  const res = await fetch(`${STRIPE_API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Stripe ${path} failed ${res.status}: ${txt}`);
  }
  return (await res.json()) as T;
}

export async function createCheckoutSession(input: {
  priceId: string;
  customerEmail?: string | null;
  clientReferenceId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ id: string; url: string }> {
  const body = form({
    mode: "subscription",
    "line_items[0][price]": input.priceId,
    "line_items[0][quantity]": "1",
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    client_reference_id: input.clientReferenceId,
    customer_email: input.customerEmail ?? undefined,
    allow_promotion_codes: "true",
  });
  return stripeFetch("/checkout/sessions", body);
}

export async function createBillingPortalSession(input: {
  customerId: string;
  returnUrl: string;
}): Promise<{ id: string; url: string }> {
  const body = form({
    customer: input.customerId,
    return_url: input.returnUrl,
  });
  return stripeFetch("/billing_portal/sessions", body);
}

export async function retrieveSubscription(id: string): Promise<{
  id: string;
  status: string;
  current_period_end: number;
  items: { data: Array<{ price: { id: string } }> };
}> {
  const { secret } = stripeConfig();
  if (!secret) throw new Error("STRIPE_SECRET_KEY not set");
  const res = await fetch(`${STRIPE_API}/subscriptions/${id}`, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  if (!res.ok) throw new Error(`retrieveSubscription failed ${res.status}`);
  return (await res.json()) as {
    id: string;
    status: string;
    current_period_end: number;
    items: { data: Array<{ price: { id: string } }> };
  };
}

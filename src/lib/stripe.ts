// Minimal Stripe helpers using fetch — avoids pulling in the full `stripe` SDK.
// All endpoints Stripe Billing exposes accept `application/x-www-form-urlencoded`
// with a Bearer secret-key auth header.

const STRIPE_API = "https://api.stripe.com/v1";

export type StripeInterval = "month" | "year";

export function stripeConfig() {
  const secret = process.env.STRIPE_SECRET_KEY;
  const priceMonthly = process.env.STRIPE_PRICE_PRO_MONTHLY;
  const priceYearly = process.env.STRIPE_PRICE_PRO_YEARLY;
  return { secret, priceMonthly, priceYearly };
}

export function stripeConfigured(): boolean {
  const { secret, priceMonthly, priceYearly } = stripeConfig();
  return Boolean(secret && (priceMonthly || priceYearly));
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

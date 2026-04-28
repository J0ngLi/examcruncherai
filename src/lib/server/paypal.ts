function normalizePaypalBaseUrl(rawUrl: string | undefined): string {
  const fallback = "https://api-m.sandbox.paypal.com";
  if (!rawUrl?.trim()) return fallback;

  const trimmed = rawUrl.trim().replace(/\/+$/, "");
  const lower = trimmed.toLowerCase();

  // Accept common dashboard host mistakes and normalize to API hosts.
  if (lower === "https://sandbox.paypal.com" || lower === "sandbox.paypal.com") {
    return "https://api-m.sandbox.paypal.com";
  }
  if (lower === "https://paypal.com" || lower === "paypal.com" || lower === "https://www.paypal.com") {
    return "https://api-m.paypal.com";
  }

  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

const paypalBaseUrl = normalizePaypalBaseUrl(process.env.PAYPAL_BASE_URL);
const paypalClientId = process.env.PAYPAL_CLIENT_ID;
const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET;
const paypalMonthlyPlanId = process.env.PAYPAL_MONTHLY_PLAN_ID;
const paypalYearlyPlanId = process.env.PAYPAL_YEARLY_PLAN_ID;
const appBaseUrl = process.env.APP_BASE_URL;

export function isPaymentsDisabled(): boolean {
  return process.env.BETA_DISABLE_PAYMENTS === "true";
}

export function hasPaypalConfig(): boolean {
  return Boolean(paypalClientId && paypalClientSecret);
}

export function getPaypalPlanId(plan: "monthly" | "yearly"): string | null {
  if (plan === "yearly") return paypalYearlyPlanId ?? null;
  return paypalMonthlyPlanId ?? null;
}

export function getAppBaseUrl(fallbackOrigin: string): string {
  if (!appBaseUrl?.trim()) return fallbackOrigin;
  const trimmed = appBaseUrl.trim().replace(/\/+$/, "");
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export async function getPaypalAccessToken(): Promise<string> {
  if (!paypalClientId || !paypalClientSecret) {
    throw new Error("PayPal credentials are missing.");
  }

  const auth = Buffer.from(`${paypalClientId}:${paypalClientSecret}`).toString("base64");

  const response = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to authenticate with PayPal.");
  }

  const payload = (await response.json()) as { access_token: string };
  return payload.access_token;
}

export async function createPaypalSubscription(accessToken: string, planId: string, returnUrl: string, cancelUrl: string, customId: string) {
  const response = await fetch(`${paypalBaseUrl}/v1/billing/subscriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      plan_id: planId,
      custom_id: customId,
      application_context: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create PayPal subscription.");
  }

  return response.json();
}

export async function getPaypalSubscription(accessToken: string, subscriptionId: string) {
  const response = await fetch(`${paypalBaseUrl}/v1/billing/subscriptions/${subscriptionId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch PayPal subscription.");
  }

  return response.json();
}

export async function cancelPaypalSubscription(accessToken: string, subscriptionId: string, reason = "Cancelled by user") {
  const response = await fetch(`${paypalBaseUrl}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) {
    throw new Error("Failed to cancel PayPal subscription.");
  }
}

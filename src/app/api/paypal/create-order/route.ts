import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/server/auth";
import { createPaypalSubscription, getPaypalAccessToken, getPaypalPlanId, hasPaypalConfig, isPaymentsDisabled } from "@/lib/server/paypal";

export async function POST(request: NextRequest) {
  if (isPaymentsDisabled()) {
    return NextResponse.json({ error: "Payments are temporarily disabled in beta mode." }, { status: 503 });
  }

  if (!hasPaypalConfig()) {
    return NextResponse.json({ error: "PayPal is not configured." }, { status: 503 });
  }

  const user = await getRequestUser(request);
  if (!user) {
    return NextResponse.json({ error: "Please log in before starting checkout." }, { status: 401 });
  }

  if (user.plan === "pro" || user.isAdmin) {
    return NextResponse.json({ error: "Your account already has Pro access." }, { status: 400 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { plan?: "monthly" | "yearly" };
    const selectedPlan = body.plan === "yearly" ? "yearly" : "monthly";
    const planId = getPaypalPlanId(selectedPlan);

    if (!planId) {
      return NextResponse.json({ error: `PayPal ${selectedPlan} plan is not configured.` }, { status: 503 });
    }

    const origin = new URL(request.url).origin;
    const accessToken = await getPaypalAccessToken();

    const subscription = (await createPaypalSubscription(
      accessToken,
      planId,
      `${origin}/billing/success`,
      `${origin}/billing/cancelled`,
      user.id,
    )) as {
      id: string;
      links?: Array<{ rel: string; href: string }>;
    };

    const approveUrl = subscription.links?.find((link) => link.rel === "approve")?.href;
    if (!approveUrl) {
      return NextResponse.json({ error: "Could not start PayPal checkout." }, { status: 500 });
    }

    return NextResponse.json({ subscriptionId: subscription.id, approveUrl });
  } catch {
    return NextResponse.json({ error: "Failed to start PayPal checkout. Please try again." }, { status: 500 });
  }
}

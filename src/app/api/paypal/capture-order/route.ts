import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-server";
import { getRequestUser } from "@/lib/server/auth";
import { getPaypalAccessToken, getPaypalSubscription, hasPaypalConfig, isPaymentsDisabled } from "@/lib/server/paypal";

export async function POST(request: NextRequest) {
  if (isPaymentsDisabled()) {
    return NextResponse.json({ error: "Payments are temporarily disabled in beta mode." }, { status: 503 });
  }

  if (!hasPaypalConfig()) {
    return NextResponse.json({ error: "PayPal is not configured." }, { status: 503 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const user = await getRequestUser(request);
  if (!user) {
    return NextResponse.json({ error: "Please log in before confirming payment." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { subscriptionId?: string };
    if (!body.subscriptionId) {
      return NextResponse.json({ error: "Missing PayPal subscription ID." }, { status: 400 });
    }

    const accessToken = await getPaypalAccessToken();
    const subscription = (await getPaypalSubscription(accessToken, body.subscriptionId)) as {
      id: string;
      status: string;
      plan_id?: string;
      subscriber?: { email_address?: string };
    };

    if (!["ACTIVE", "APPROVAL_PENDING"].includes(subscription.status)) {
      return NextResponse.json({ error: "Subscription is not active yet. Please wait and refresh." }, { status: 400 });
    }

    await supabase.from("users").update({ plan: "pro" }).eq("id", user.id);

    await supabase.from("paypal_subscriptions").upsert({
      user_id: user.id,
      paypal_subscription_id: subscription.id,
      paypal_plan_id: subscription.plan_id ?? null,
      status: subscription.status,
      payer_email: subscription.subscriber?.email_address ?? null,
      event_source: "callback",
    });

    return NextResponse.json({ success: true, status: subscription.status });
  } catch {
    return NextResponse.json({ error: "Could not confirm PayPal subscription. Please contact support if needed." }, { status: 500 });
  }
}

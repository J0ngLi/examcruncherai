import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-server";
import { getRequestUser } from "@/lib/server/auth";
import { cancelPaypalSubscription, getPaypalAccessToken, hasPaypalConfig, isPaymentsDisabled } from "@/lib/server/paypal";

export async function POST(request: NextRequest) {
  if (isPaymentsDisabled()) {
    return NextResponse.json({ error: "Subscription cancellation is disabled in beta mode." }, { status: 503 });
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
    return NextResponse.json({ error: "Please log in first." }, { status: 401 });
  }

  const { data: subscription } = await supabase
    .from("paypal_subscriptions")
    .select("paypal_subscription_id")
    .eq("user_id", user.id)
    .in("status", ["ACTIVE", "APPROVAL_PENDING"])
    .order("created_at", { ascending: false })
    .maybeSingle();

  if (!subscription?.paypal_subscription_id) {
    return NextResponse.json({ error: "No active subscription found. Please contact support if needed." }, { status: 404 });
  }

  try {
    const accessToken = await getPaypalAccessToken();
    await cancelPaypalSubscription(accessToken, subscription.paypal_subscription_id);

    await supabase.from("paypal_subscriptions").update({ status: "CANCELLED", event_source: "user" }).eq("paypal_subscription_id", subscription.paypal_subscription_id);
    await supabase.from("users").update({ plan: user.isAdmin ? "pro" : "free" }).eq("id", user.id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Could not cancel subscription automatically. Please contact support." }, { status: 500 });
  }
}

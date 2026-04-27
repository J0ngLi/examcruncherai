import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: true });
  }

  try {
    const payload = (await request.json()) as {
      event_type?: string;
      resource?: {
        id?: string;
        custom_id?: string;
        status?: string;
        plan_id?: string;
        subscriber?: { email_address?: string };
      };
    };

    const subscriptionEvents = new Set([
      "BILLING.SUBSCRIPTION.ACTIVATED",
      "BILLING.SUBSCRIPTION.UPDATED",
      "BILLING.SUBSCRIPTION.CANCELLED",
      "BILLING.SUBSCRIPTION.EXPIRED",
      "BILLING.SUBSCRIPTION.SUSPENDED",
    ]);

    if (payload.event_type && subscriptionEvents.has(payload.event_type)) {
      const status = payload.resource?.status ?? payload.event_type;
      const userId = payload.resource?.custom_id;
      const isActive = status === "ACTIVE" || payload.event_type === "BILLING.SUBSCRIPTION.ACTIVATED";

      if (userId) {
        await supabase.from("users").update({ plan: isActive ? "pro" : "free" }).eq("id", userId);
      }

      await supabase.from("paypal_subscriptions").upsert({
        user_id: userId ?? null,
        paypal_subscription_id: payload.resource?.id ?? null,
        paypal_plan_id: payload.resource?.plan_id ?? null,
        status,
        payer_email: payload.resource?.subscriber?.email_address ?? null,
        event_source: "webhook",
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}

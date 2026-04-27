import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-server";
import { getRequestUser } from "@/lib/server/auth";

const freePlanLimit = Number(process.env.FREE_PLAN_LIMIT ?? 3);

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const user = await getRequestUser(request);
  if (!user) {
    return NextResponse.json({ error: "Please log in." }, { status: 401 });
  }

  const [{ count }, { data: subscription }] = await Promise.all([
    supabase.from("revision_sets").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase
      .from("paypal_subscriptions")
      .select("paypal_subscription_id, status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .maybeSingle(),
  ]);

  return NextResponse.json({
    id: user.id,
    email: user.email,
    isAdmin: user.isAdmin,
    plan: user.isAdmin ? "admin" : user.plan,
    usage: count ?? 0,
    freePlanLimit,
    subscriptionStatus: subscription?.status ?? null,
    subscriptionId: subscription?.paypal_subscription_id ?? null,
  });
}

export async function DELETE(request: NextRequest) {
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const user = await getRequestUser(request);
  if (!user) {
    return NextResponse.json({ error: "Please log in." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { confirm?: string };
  if (body.confirm !== "DELETE") {
    return NextResponse.json({ error: "Please type DELETE to confirm account deletion." }, { status: 400 });
  }

  try {
    await Promise.all([
      supabase.from("paypal_subscriptions").delete().eq("user_id", user.id),
      supabase.from("revision_sets").delete().eq("user_id", user.id),
      supabase.from("users").delete().eq("id", user.id),
    ]);

    // Best-effort auth account removal.
    await supabase.auth.admin.deleteUser(user.id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Could not delete your account right now." }, { status: 500 });
  }
}

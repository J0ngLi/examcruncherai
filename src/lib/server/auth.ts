import { NextRequest } from "next/server";
import { getServerSupabase } from "@/lib/supabase-server";

export type RequestUser = {
  id: string;
  email: string;
  isAdmin: boolean;
  plan: "free" | "pro";
};

const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);
const hardcodedAdminEmails = ["omirserikzanali@gmail.com"];

export async function getRequestUser(request: NextRequest): Promise<RequestUser | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice("Bearer ".length);
  const supabase = getServerSupabase();
  if (!supabase) return null;

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user?.email) {
    return null;
  }

  const email = user.email.toLowerCase();
  const isAdmin = adminEmails.includes(email) || hardcodedAdminEmails.includes(email);

  const { data: existingUser } = await supabase
    .from("users")
    .select("id, email, plan")
    .eq("id", user.id)
    .maybeSingle();

  if (!existingUser) {
    await supabase.from("users").upsert({
      id: user.id,
      email,
      plan: isAdmin ? "pro" : "free",
      is_admin: isAdmin,
    });
  } else if (existingUser.email !== email || isAdmin) {
    await supabase
      .from("users")
      .update({ email, is_admin: isAdmin })
      .eq("id", user.id);
  }

  const plan = (existingUser?.plan as "free" | "pro" | undefined) ?? (isAdmin ? "pro" : "free");

  return {
    id: user.id,
    email,
    isAdmin,
    plan,
  };
}

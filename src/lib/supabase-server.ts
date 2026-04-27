import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const hasServerSupabase = Boolean(supabaseUrl && serviceRoleKey);

export function getServerSupabase() {
  if (!hasServerSupabase) {
    return null;
  }

  return createClient(supabaseUrl!, serviceRoleKey!, {
    auth: { persistSession: false },
  });
}

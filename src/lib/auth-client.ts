"use client";

import { supabase } from "@/lib/supabase";

export async function getAccessToken(): Promise<string | null> {
  if (!supabase) return null;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token ?? null;
}

export async function getCurrentUserEmail(): Promise<string | null> {
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.email ?? null;
}

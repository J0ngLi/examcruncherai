"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase, hasSupabaseConfig } from "@/lib/supabase";

const protectedPrefixes = ["/dashboard", "/revision-sets"];

export function ProtectedRouteGate() {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  const needsAuth = useMemo(
    () => protectedPrefixes.some((prefix) => pathname.startsWith(prefix)),
    [pathname],
  );

  useEffect(() => {
    if (!needsAuth || !hasSupabaseConfig || !supabase) {
      const id = window.setTimeout(() => setChecking(false), 0);
      return () => window.clearTimeout(id);
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/auth?next=" + encodeURIComponent(pathname));
      }
      const id = window.setTimeout(() => setChecking(false), 0);
      return () => window.clearTimeout(id);
    });
  }, [needsAuth, pathname, router]);

  if (checking && needsAuth && hasSupabaseConfig) {
    return <div className="p-4 text-sm text-slate-600">Checking your session...</div>;
  }

  return null;
}

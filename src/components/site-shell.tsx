"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProtectedRouteGate } from "@/components/protected-route-gate";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";

const baseLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/revision-sets/new", label: "Create" },
  { href: "/pricing", label: "Pricing" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    if (!hasSupabaseConfig || !supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setIsSignedIn(Boolean(data.session));
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(Boolean(session));
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    if (!hasSupabaseConfig || !supabase) return;
    await supabase.auth.signOut();
    window.location.href = "/auth";
  }

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Link href="/" className="text-lg font-bold text-slate-900">
          ExamCrunch AI
        </Link>
        <nav className="flex max-w-full flex-nowrap items-center gap-3 overflow-x-auto sm:justify-end sm:gap-5">
          {baseLinks.map((link) => (
            <Link key={link.href} href={link.href} className="shrink-0 whitespace-nowrap text-sm font-medium text-slate-600 transition hover:text-slate-900">
              {link.label}
            </Link>
          ))}
          {isSignedIn ? (
            <>
              <Link href="/account" className="shrink-0 whitespace-nowrap text-sm font-medium text-slate-600 transition hover:text-slate-900">
                Account
              </Link>
              <button onClick={handleLogout} className="shrink-0 whitespace-nowrap text-sm font-medium text-slate-600 transition hover:text-slate-900">
                Logout
              </button>
            </>
          ) : (
            <Link href="/auth" className="shrink-0 whitespace-nowrap text-sm font-medium text-slate-600 transition hover:text-slate-900">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="animate-fade-up mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <ProtectedRouteGate />
        {children}
      </main>
    </div>
  );
}

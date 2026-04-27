"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AppShell } from "@/components/site-shell";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    if (!hasSupabaseConfig || !supabase) {
      setMessage("Supabase is not configured yet. Demo mode active, continue to dashboard.");
      return;
    }

    setIsLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    setMessage("Signed in successfully. Continue to dashboard.");
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold">Sign up / login</h1>
        <p className="mt-2 text-sm text-slate-600">Use Supabase auth when configured. Until then, demo mode is available.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-indigo-200 focus:ring"
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-indigo-200 focus:ring"
              placeholder="At least 6 characters"
            />
          </label>

          {error ? <p className="rounded-lg bg-rose-50 p-2 text-sm text-rose-700">{error}</p> : null}
          {message ? <p className="rounded-lg bg-emerald-50 p-2 text-sm text-emerald-700">{message}</p> : null}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Please wait..." : "Continue"}
          </button>
        </form>

        <Link href="/dashboard" className="mt-4 inline-flex text-sm font-semibold text-indigo-600 hover:text-indigo-700">
          Go to dashboard
        </Link>
      </div>
    </AppShell>
  );
}

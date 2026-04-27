"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { AppShell } from "@/components/site-shell";
import { trackEvent } from "@/lib/analytics";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";

export default function AuthPage() {
  const router = useRouter();
  const nextUrl = useMemo(() => {
    if (typeof window === "undefined") return "/dashboard";
    return new URLSearchParams(window.location.search).get("next") || "/dashboard";
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
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
    if (mode === "signup" && password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }

    if (!hasSupabaseConfig || !supabase) {
      trackEvent(mode === "signup" ? "signup" : "login", { mode: "demo" });
      setMessage("You are now signed in for beta access.");
      router.push(nextUrl);
      return;
    }

    setIsLoading(true);

    if (mode === "signup") {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      setIsLoading(false);

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      trackEvent("signup", { mode: "supabase" });
      setMessage("Account created successfully. You can now log in.");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);

    if (signInError) {
      setError("Login failed. Please check your details and try again.");
      return;
    }

    trackEvent("login", { mode: "supabase" });
    router.push(nextUrl);
  }

  async function handleForgotPassword() {
    setError(null);
    setMessage(null);

    if (!email) {
      setError("Enter your email first, then click forgot password.");
      return;
    }

    if (!hasSupabaseConfig || !supabase) {
      setMessage("Password reset is unavailable in local beta mode.");
      return;
    }

    setIsResettingPassword(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
    setIsResettingPassword(false);

    if (resetError) {
      setError("Could not send reset email. Please try again.");
      return;
    }

    setMessage("Password reset email sent. Check your inbox.");
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold">Sign up / login</h1>
        <p className="mt-2 text-sm text-slate-600">Access your account to generate and save revision sets.</p>

        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
          <button type="button" onClick={() => setMode("login")} className={`rounded-lg px-3 py-2 text-sm ${mode === "login" ? "bg-white shadow" : "text-slate-600"}`}>
            Login
          </button>
          <button type="button" onClick={() => setMode("signup")} className={`rounded-lg px-3 py-2 text-sm ${mode === "signup" ? "bg-white shadow" : "text-slate-600"}`}>
            Sign up
          </button>
        </div>

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
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={isResettingPassword}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-60"
          >
            {isResettingPassword ? "Sending reset email..." : "Forgot password?"}
          </button>

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
            {isLoading ? "Please wait..." : mode === "signup" ? "Create account" : "Continue"}
          </button>
        </form>

        <Link href="/dashboard" className="mt-4 inline-flex text-sm font-semibold text-indigo-600 hover:text-indigo-700">
          Go to dashboard
        </Link>
      </div>
    </AppShell>
  );
}

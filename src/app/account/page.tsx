"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/site-shell";
import { getAccessToken } from "@/lib/auth-client";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";

type AccountPayload = {
  email: string;
  plan: "free" | "pro" | "admin";
  usage: number;
  freePlanLimit: number;
  subscriptionStatus: string | null;
};

export default function AccountPage() {
  const router = useRouter();
  const [account, setAccount] = useState<AccountPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  useEffect(() => {
    (async () => {
      const token = await getAccessToken();
      if (!token) {
        setError("Please log in to view account settings.");
        return;
      }

      const response = await fetch("/api/account", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        setError("Could not load your account.");
        return;
      }

      setAccount((await response.json()) as AccountPayload);
    })();
  }, []);

  async function handleCancelSubscription() {
    setError(null);
    setIsCancelling(true);

    const token = await getAccessToken();
    if (!token) {
      setError("Please log in first.");
      setIsCancelling(false);
      return;
    }

    const response = await fetch("/api/paypal/cancel-subscription", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(payload.error ?? "Could not cancel subscription automatically. Contact support.");
      setIsCancelling(false);
      return;
    }

    setIsCancelling(false);
    router.refresh();
    window.location.reload();
  }

  async function handleDeleteAccount() {
    setError(null);
    if (confirmText !== "DELETE") {
      setError("Please type DELETE to confirm account deletion.");
      return;
    }

    setIsDeleting(true);

    const token = await getAccessToken();
    if (!token) {
      setError("Please log in first.");
      setIsDeleting(false);
      return;
    }

    const response = await fetch("/api/account", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ confirm: "DELETE" }),
    });

    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(payload.error ?? "Could not delete account.");
      setIsDeleting(false);
      return;
    }

    if (hasSupabaseConfig && supabase) {
      await supabase.auth.signOut();
    }

    router.push("/");
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h1 className="text-2xl font-bold">Account</h1>
          {account ? (
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <p><span className="font-semibold">Email:</span> {account.email}</p>
              <p><span className="font-semibold">Plan:</span> {account.plan === "admin" ? "Admin" : account.plan === "pro" ? "Pro" : "Free"}</p>
              <p><span className="font-semibold">Usage:</span> {account.usage} / {account.plan === "free" ? account.freePlanLimit : "Unlimited"}</p>
              <p><span className="font-semibold">Subscription status:</span> {account.subscriptionStatus ?? "Not active"}</p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-600">Loading account details...</p>
          )}
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/dashboard" className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">Back to dashboard</Link>
            <Link href="/pricing" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">Upgrade</Link>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Subscription management</h2>
          <p className="mt-1 text-sm text-slate-600">If you have Pro, you can request cancellation here.</p>
          <button
            onClick={handleCancelSubscription}
            disabled={isCancelling}
            className="mt-4 rounded-lg border border-amber-300 px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 disabled:opacity-60"
          >
            {isCancelling ? "Cancelling subscription..." : "Cancel subscription"}
          </button>
          <p className="mt-2 text-xs text-slate-500">If cancellation cannot be automated, contact support at contact@example.com.</p>
        </section>

        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
          <h2 className="text-lg font-semibold text-rose-900">Delete account</h2>
          <p className="mt-2 text-sm text-rose-800">
            Warning: this permanently deletes your revision sets and account data.
          </p>
          <label className="mt-3 block text-sm font-medium text-rose-900">
            Type DELETE to confirm
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="mt-1 w-full rounded-lg border border-rose-300 bg-white px-3 py-2"
            />
          </label>
          <button
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="mt-4 rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-60"
          >
            {isDeleting ? "Deleting account..." : "Delete account permanently"}
          </button>
        </section>

        {error ? <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
      </div>
    </AppShell>
  );
}

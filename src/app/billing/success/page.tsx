"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/site-shell";
import { getAccessToken } from "@/lib/auth-client";

export default function BillingSuccessPage() {
  const [message, setMessage] = useState("Finalizing your payment...");

  useEffect(() => {
    async function finalize() {
      const url = new URL(window.location.href);
      const subscriptionId = url.searchParams.get("subscription_id") ?? url.searchParams.get("token");
      if (!subscriptionId) {
        setMessage("Payment token missing. Please contact support if you were charged.");
        return;
      }

      const token = await getAccessToken();
      if (!token) {
        setMessage("Please log in and retry payment confirmation.");
        return;
      }

      const response = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subscriptionId }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setMessage(payload.error ?? "Payment confirmation failed.");
        return;
      }

      setMessage("Subscription confirmed. Your account is now Pro.");
    }

    finalize();
  }, []);

  return (
    <AppShell>
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold">Payment success</h1>
        <p className="mt-3 text-sm text-slate-700">{message}</p>
        <Link href="/dashboard" className="mt-5 inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
          Go to dashboard
        </Link>
      </div>
    </AppShell>
  );
}

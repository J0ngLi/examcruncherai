"use client";

import Link from "next/link";
import { useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { getAccessToken } from "@/lib/auth-client";
import { AppShell } from "@/components/site-shell";

const tiers = [
  {
    id: "free",
    name: "Free Beta",
    price: "£0",
    description: "Best for trying ExamCrunch AI",
    features: ["3 revision sets", "Basic flashcards + quizzes", "Local storage"],
    cta: "Start free",
  },
  {
    id: "monthly",
    name: "Pro Monthly",
    price: "£9/month",
    description: "Unlimited revision sets and full access",
    features: ["Unlimited sets", "Cloud sync with Supabase", "Priority generation"],
    cta: "Upgrade with PayPal",
  },
  {
    id: "yearly",
    name: "Pro Yearly",
    price: "£79/year",
    description: "Save with annual billing",
    features: ["Everything in Pro Monthly", "Best value plan"],
    cta: "Upgrade yearly",
  },
] as const;

export default function PricingPage() {
  const [error, setError] = useState<string | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  async function startCheckout(plan: "monthly" | "yearly") {
    setError(null);
    setLoadingPlan(plan);

    try {
      const token = await getAccessToken();
      if (!token) {
        setError("Please log in before starting checkout.");
        setLoadingPlan(null);
        return;
      }

      trackEvent("upgrade_clicked", { plan });
      trackEvent("checkout_started", { plan, provider: "paypal" });

      const response = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan }),
      });

      const payload = (await response.json()) as { approveUrl?: string; error?: string };

      if (!response.ok || !payload.approveUrl) {
        throw new Error(payload.error ?? "Could not start PayPal checkout.");
      }

      window.location.assign(payload.approveUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout.");
      setLoadingPlan(null);
    }
  }

  return (
    <AppShell>
      <h1 className="text-3xl font-bold">Pricing</h1>
      <p className="mt-2 text-slate-600">Simple plans built for student revision goals.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {tiers.map((tier) => (
          <article key={tier.id} className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-bold">{tier.name}</h2>
            <p className="mt-1 text-2xl font-semibold">{tier.price}</p>
            <p className="mt-2 text-sm text-slate-600">{tier.description}</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {tier.features.map((feature) => (
                <li key={feature}>• {feature}</li>
              ))}
            </ul>
            {tier.id === "free" ? (
              <button className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                {tier.cta}
              </button>
            ) : (
              <button
                onClick={() => startCheckout(tier.id)}
                disabled={loadingPlan === tier.id}
                className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {loadingPlan === tier.id ? "Redirecting to PayPal..." : tier.cta}
              </button>
            )}
          </article>
        ))}
      </div>

      {error ? <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

      <Link href="/dashboard" className="mt-6 inline-flex text-sm font-semibold text-indigo-600 hover:text-indigo-700">
        Back to dashboard
      </Link>
    </AppShell>
  );
}

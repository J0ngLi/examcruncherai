import Link from "next/link";
import { AppShell } from "@/components/site-shell";

const tiers = [
  {
    name: "Free",
    price: "£0",
    description: "Best for trying ExamCrunch AI",
    features: ["3 revision sets", "Basic flashcards + quizzes", "Local storage"],
    cta: "Start free",
  },
  {
    name: "Pro",
    price: "£9/month",
    description: "Stripe-ready placeholder plan",
    features: ["Unlimited sets", "Cloud sync with Supabase", "Priority generation"],
    cta: "Upgrade (coming soon)",
  },
];

export default function PricingPage() {
  return (
    <AppShell>
      <h1 className="text-3xl font-bold">Pricing</h1>
      <p className="mt-2 text-slate-600">Stripe-ready pricing page with placeholder checkout for MVP.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {tiers.map((tier) => (
          <article key={tier.name} className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-bold">{tier.name}</h2>
            <p className="mt-1 text-2xl font-semibold">{tier.price}</p>
            <p className="mt-2 text-sm text-slate-600">{tier.description}</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {tier.features.map((feature) => (
                <li key={feature}>• {feature}</li>
              ))}
            </ul>
            <button className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              {tier.cta}
            </button>
          </article>
        ))}
      </div>

      <Link href="/dashboard" className="mt-6 inline-flex text-sm font-semibold text-indigo-600 hover:text-indigo-700">
        Back to dashboard
      </Link>
    </AppShell>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "AI Study Tool for GCSE, A-Level and University",
  description:
    "ExamCrunch AI helps GCSE, A-Level, and university students convert notes into flashcards, quizzes, and weekly revision plans.",
};

const benefits = [
  "Revise smarter with active recall flashcards",
  "Practise exam-style quizzes with explanations",
  "Stay consistent using a guided 7-day plan",
];

const howItWorks = [
  "Paste notes, upload a .txt file, or type a topic.",
  "Generate summary, flashcards, quiz, and revision plan.",
  "Study daily and track progress from one dashboard.",
];

const pricing = [
  { tier: "Free", bestFor: "Try the full workflow", details: "3 revision sets, core generation, local history" },
  { tier: "Pro", bestFor: "Serious exam prep", details: "Unlimited sets, sync, faster generation (coming soon)" },
  { tier: "Team", bestFor: "Study groups", details: "Shared sets, collaboration, group insights (coming soon)" },
];

const testimonials = [
  { name: "GCSE Student", quote: "I went from random notes to a real revision routine in one evening." },
  { name: "A-Level Student", quote: "The quiz explanations helped me fix mistakes quickly before mocks." },
  { name: "University Student", quote: "Great for turning long lecture notes into clear daily tasks." },
];

const faq = [
  { q: "Does it work without an API key?", a: "Yes. It uses mock generation until OpenAI is configured." },
  { q: "Can I use it on mobile?", a: "Yes. The interface is mobile-first and responsive." },
  { q: "Can I upgrade later?", a: "Yes. Pricing is Stripe-ready, with checkout hooks prepared." },
];

export default function HomePage() {
  return (
    <AppShell>
      <section className="animate-fade-up rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-500 px-6 py-12 text-white sm:px-10 sm:py-16">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-indigo-100">ExamCrunch AI</p>
        <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">
          Turn your notes into flashcards, quizzes, and revision plans in seconds.
        </h1>
        <p className="mt-4 max-w-2xl text-indigo-100">
          Built for GCSE, A-Level, and university students who want better results with less revision chaos.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/auth" className="inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50">
            Start revising free
          </Link>
          <Link href="/pricing" className="inline-flex rounded-xl border border-white/50 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
            View plans
          </Link>
        </div>
      </section>

      <section className="animate-fade-up mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold">Why students choose ExamCrunch AI</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {benefits.map((item) => (
            <li key={item} className="rounded-xl border border-slate-200 p-4 text-sm text-slate-700 transition hover:-translate-y-0.5 hover:shadow-sm">{item}</li>
          ))}
        </ul>
      </section>

      <section className="animate-fade-up mt-10 grid gap-6 md:grid-cols-3">
        <InfoCard title="How it works" items={howItWorks} />
        <InfoCard title="Pricing comparison" items={pricing.map((item) => `${item.tier}: ${item.bestFor}. ${item.details}`)} cta={{ label: "See full pricing", href: "/pricing" }} />
        <InfoCard title="Quick outcomes" items={["Less overwhelm before exams", "Faster daily revision decisions", "More confidence through practice"]} />
      </section>

      <section className="animate-fade-up mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold">Student feedback</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} className="rounded-xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:shadow-sm">
              <p className="text-sm text-slate-700">“{item.quote}”</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{item.name}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="animate-fade-up mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold">FAQ</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {faq.map((item) => (
            <article key={item.q} className="rounded-xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:shadow-sm">
              <h3 className="font-semibold">{item.q}</h3>
              <p className="mt-1 text-sm text-slate-600">{item.a}</p>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function InfoCard({
  title,
  items,
  cta,
}: {
  title: string;
  items: string[];
  cta?: { label: string; href: string };
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <ul className="mt-4 space-y-2 text-sm text-slate-600">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
      {cta ? (
        <Link href={cta.href} className="mt-4 inline-flex text-sm font-semibold text-indigo-600 hover:text-indigo-700">
          {cta.label}
        </Link>
      ) : null}
    </article>
  );
}

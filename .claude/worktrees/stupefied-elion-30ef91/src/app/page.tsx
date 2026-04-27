import Link from "next/link";
import { AppShell } from "@/components/site-shell";

const howItWorks = [
  "Paste notes, upload a .txt file, or type a topic.",
  "Generate flashcards, quiz questions, summary, and a 7-day plan.",
  "Save sets and revise from any device after auth setup.",
];

const features = [
  "Student-friendly summaries",
  "Smart flashcards for active recall",
  "Exam-style multiple-choice quizzes",
  "7-day revision structure",
  "Supabase-ready authentication and storage",
];

const faq = [
  {
    q: "Do I need an OpenAI API key?",
    a: "No. The app works with realistic mock output until you add your key.",
  },
  {
    q: "Can I save multiple revision sets?",
    a: "Yes. In MVP mode they are stored locally; Supabase can be enabled for cloud data.",
  },
  {
    q: "Is this mobile-friendly?",
    a: "Yes. The interface is mobile-first with clear cards and buttons.",
  },
];

export default function HomePage() {
  return (
    <AppShell>
      <section className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-500 px-6 py-12 text-white sm:px-10">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-indigo-100">ExamCrunch AI</p>
        <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">
          Turn your notes into flashcards, quizzes, and revision plans in seconds.
        </h1>
        <p className="mt-4 max-w-2xl text-indigo-100">
          Go from messy notes to a clear revision path with one click.
        </p>
        <Link
          href="/auth"
          className="mt-8 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
        >
          Start revising free
        </Link>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-3">
        <InfoCard title="How it works" items={howItWorks} />
        <InfoCard title="Features" items={features} />
        <InfoCard
          title="Pricing"
          items={[
            "Free: 3 revision sets",
            "Pro (Stripe-ready): unlimited sets",
            "Team plans coming soon",
          ]}
          cta={{ label: "View pricing", href: "/pricing" }}
        />
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold">FAQ</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {faq.map((item) => (
            <article key={item.q} className="rounded-xl border border-slate-200 p-4">
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
    <article className="rounded-2xl border border-slate-200 bg-white p-6">
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

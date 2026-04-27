"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/site-shell";
import { getRevisionSetById } from "@/lib/revision-storage";

export default function FlashcardsPage() {
  const params = useParams<{ id: string }>();
  const set = params?.id ? getRevisionSetById(params.id) : null;

  if (!set) {
    return (
      <AppShell>
        <p className="rounded-xl bg-amber-50 p-4 text-amber-700">Revision set not found. Create one first.</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <h1 className="text-2xl font-bold">Flashcards: {set.topic}</h1>
      <p className="mt-1 text-sm text-slate-600">{set.materials.summary}</p>

      <div className="mt-6 grid gap-4">
        {set.materials.flashcards.map((card, index) => (
          <article key={card.question} className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Card {index + 1}</p>
            <h2 className="mt-2 font-semibold">{card.question}</h2>
            <p className="mt-3 text-sm text-slate-700">{card.answer}</p>
          </article>
        ))}
      </div>

      <div className="mt-6 flex gap-3">
        <Link href={`/revision-sets/${set.id}/quiz`} className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
          Go to quiz
        </Link>
        <Link href={`/revision-sets/${set.id}/plan`} className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
          Go to revision plan
        </Link>
      </div>
    </AppShell>
  );
}

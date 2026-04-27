"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/site-shell";
import { loadRevisionSet } from "@/lib/revision-data";
import { RevisionSet } from "@/types/revision";

export default function FlashcardsPage() {
  const params = useParams<{ id: string }>();
  const [set, setSet] = useState<RevisionSet | null>(null);
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    if (!params?.id) return;

    loadRevisionSet(params.id).then((result) => {
      setSet(result);
    });
  }, [params?.id]);

  const total = set?.materials.flashcards.length ?? 0;
  const card = useMemo(() => (set ? set.materials.flashcards[index] : null), [index, set]);

  function nextCard() {
    if (!set) return;
    setShowAnswer(false);
    setIndex((prev) => (prev + 1) % set.materials.flashcards.length);
  }

  function previousCard() {
    if (!set) return;
    setShowAnswer(false);
    setIndex((prev) => (prev - 1 + set.materials.flashcards.length) % set.materials.flashcards.length);
  }

  if (!set || !card) {
    return (
      <AppShell>
        <p className="rounded-xl bg-amber-50 p-4 text-amber-700">Revision set not found. Create one first.</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <h1 className="text-2xl font-bold">Flashcards: {set.topic}</h1>
      <p className="mt-1 text-sm text-slate-600">Try answering before revealing the card answer.</p>

      <div className="mt-6">
        <p className="mb-2 text-sm text-slate-600">Progress: {index + 1} / {total}</p>
        <article className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Question</p>
          <p className="mt-4 text-lg font-semibold text-slate-900">{card.question}</p>
          {showAnswer ? (
            <div className="mt-5 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Answer</p>
              <p className="mt-2 text-base font-medium text-indigo-950">{card.answer}</p>
            </div>
          ) : null}
        </article>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <button onClick={previousCard} className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">
          Previous
        </button>
        <button
          onClick={() => setShowAnswer((prev) => !prev)}
          className="rounded-lg border border-indigo-300 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
        >
          {showAnswer ? "Hide answer" : "Reveal answer"}
        </button>
        <button onClick={nextCard} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
          Next
        </button>
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

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/site-shell";
import { getRevisionSets } from "@/lib/revision-storage";
import { RevisionSet } from "@/types/revision";

export default function DashboardPage() {
  const [sets, setSets] = useState<RevisionSet[]>([]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSets(getRevisionSets());
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <AppShell>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Your revision sets</h1>
          <p className="text-sm text-slate-600">Track, review, and open your study materials.</p>
        </div>
        <Link href="/revision-sets/new" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
          Create new revision set
        </Link>
      </div>

      <div className="mt-6 grid gap-4">
        {sets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="font-medium">No revision sets yet.</p>
            <p className="mt-1 text-sm text-slate-600">Create your first one to generate flashcards and quizzes.</p>
          </div>
        ) : (
          sets.map((set) => (
            <article key={set.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-semibold">{set.topic}</h2>
              <p className="mt-1 text-sm text-slate-600">
                {set.subject} • {set.examLevel} • {new Date(set.createdAt).toLocaleDateString()}
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <Link href={`/revision-sets/${set.id}/flashcards`} className="rounded-lg border border-slate-300 px-3 py-1 hover:bg-slate-50">
                  Flashcards
                </Link>
                <Link href={`/revision-sets/${set.id}/quiz`} className="rounded-lg border border-slate-300 px-3 py-1 hover:bg-slate-50">
                  Quiz
                </Link>
                <Link href={`/revision-sets/${set.id}/plan`} className="rounded-lg border border-slate-300 px-3 py-1 hover:bg-slate-50">
                  Revision plan
                </Link>
              </div>
            </article>
          ))
        )}
      </div>
    </AppShell>
  );
}

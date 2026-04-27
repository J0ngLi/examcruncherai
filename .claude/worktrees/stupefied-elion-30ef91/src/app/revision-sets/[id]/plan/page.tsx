"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/site-shell";
import { getRevisionSetById } from "@/lib/revision-storage";

export default function RevisionPlanPage() {
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
      <h1 className="text-2xl font-bold">7-day revision plan: {set.topic}</h1>
      <p className="mt-1 text-sm text-slate-600">Follow this daily structure to build confidence before your exam.</p>

      <div className="mt-6 grid gap-4">
        {set.materials.revision_plan.map((day) => (
          <article key={day.day} className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Day {day.day}</p>
            <h2 className="mt-1 text-lg font-semibold">{day.focus}</h2>
            <ul className="mt-3 space-y-1 text-sm text-slate-700">
              {day.tasks.map((task) => (
                <li key={task}>• {task}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <Link href={`/revision-sets/${set.id}/flashcards`} className="mt-6 inline-flex rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
        Back to flashcards
      </Link>
    </AppShell>
  );
}

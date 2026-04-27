"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/site-shell";
import { loadRevisionSet } from "@/lib/revision-data";
import { RevisionSet } from "@/types/revision";

function getChecklistKey(id: string) {
  return `revision_plan_checks_${id}`;
}

export default function RevisionPlanPage() {
  const params = useParams<{ id: string }>();
  const [set, setSet] = useState<RevisionSet | null>(null);
  const [completed, setCompleted] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!params?.id) return;

    loadRevisionSet(params.id).then((result) => {
      setSet(result);

      if (!result) return;
      const raw = window.localStorage.getItem(getChecklistKey(result.id));
      if (raw) {
        setCompleted(JSON.parse(raw) as Record<number, boolean>);
      }
    });
  }, [params?.id]);

  const doneCount = useMemo(
    () => Object.values(completed).filter(Boolean).length,
    [completed],
  );

  function toggleDay(day: number) {
    if (!set) return;

    setCompleted((prev) => {
      const next = { ...prev, [day]: !prev[day] };
      window.localStorage.setItem(getChecklistKey(set.id), JSON.stringify(next));
      return next;
    });
  }

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
      <p className="mt-1 text-sm text-slate-600">Checklist progress: {doneCount}/{set.materials.revisionPlan.length} complete</p>

      <div className="mt-6 grid gap-4">
        {set.materials.revisionPlan.map((day) => {
          const isDone = Boolean(completed[day.day]);

          return (
            <article key={day.day} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Day {day.day}</p>
                  <p className="mt-2 font-medium text-slate-900">{day.task}</p>
                  <p className="mt-1 text-sm text-slate-600">Estimated time: {day.estimatedTime}</p>
                </div>
                <button
                  onClick={() => toggleDay(day.day)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium ${
                    isDone ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {isDone ? "Completed" : "Mark done"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <Link href={`/revision-sets/${set.id}/flashcards`} className="mt-6 inline-flex rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
        Back to flashcards
      </Link>
    </AppShell>
  );
}

"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/site-shell";
import { getRevisionSetById } from "@/lib/revision-storage";

export default function QuizPage() {
  const params = useParams<{ id: string }>();
  const [selected, setSelected] = useState<Record<number, string>>({});
  const set = params?.id ? getRevisionSetById(params.id) : null;

  const score = useMemo(() => {
    if (!set) return 0;
    return set.materials.quiz.reduce((acc, question, idx) => {
      return selected[idx] === question.correctAnswer ? acc + 1 : acc;
    }, 0);
  }, [selected, set]);

  if (!set) {
    return (
      <AppShell>
        <p className="rounded-xl bg-amber-50 p-4 text-amber-700">Revision set not found. Create one first.</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <h1 className="text-2xl font-bold">Quiz: {set.topic}</h1>
      <p className="mt-1 text-sm text-slate-600">Choose the best answer for each question.</p>

      <div className="mt-6 grid gap-4">
        {set.materials.quiz.map((question, index) => (
          <article key={question.question} className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold">{index + 1}. {question.question}</h2>
            <div className="mt-3 grid gap-2">
              {question.options.map((option) => {
                const isPicked = selected[index] === option;
                const showResult = Boolean(selected[index]);
                const isCorrect = option === question.correctAnswer;

                return (
                  <button
                    key={option}
                    onClick={() => setSelected((prev) => ({ ...prev, [index]: option }))}
                    className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                      isPicked ? "border-indigo-500 bg-indigo-50" : "border-slate-300 hover:bg-slate-50"
                    } ${showResult && isCorrect ? "border-emerald-500 bg-emerald-50" : ""}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 rounded-xl bg-slate-900 p-4 text-white">
        Score: {score} / {set.materials.quiz.length}
      </div>
    </AppShell>
  );
}

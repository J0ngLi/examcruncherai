"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/site-shell";
import { trackEvent } from "@/lib/analytics";
import { loadRevisionSet } from "@/lib/revision-data";
import { RevisionSet } from "@/types/revision";

export default function QuizPage() {
  const params = useParams<{ id: string }>();
  const [set, setSet] = useState<RevisionSet | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [checkedAnswers, setCheckedAnswers] = useState<Record<number, boolean>>({});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    loadRevisionSet(params.id).then((result) => setSet(result));
  }, [params?.id]);

  useEffect(() => {
    if (set) {
      trackEvent("quiz_started", { revisionSetId: set.id, topic: set.topic });
    }
  }, [set]);

  const score = useMemo(() => {
    if (!set) return 0;
    return set.materials.quiz.reduce((sum, question, index) => {
      return answers[index] === question.correctAnswer ? sum + 1 : sum;
    }, 0);
  }, [answers, set]);

  if (!set) {
    return (
      <AppShell>
        <p className="rounded-xl bg-amber-50 p-4 text-amber-700">Revision set not found. Create one first.</p>
      </AppShell>
    );
  }

  const question = set.materials.quiz[currentIndex];
  const selected = answers[currentIndex];
  const hasAnswered = Boolean(checkedAnswers[currentIndex]);

  if (showResults) {
    return (
      <AppShell>
        <h1 className="text-2xl font-bold">Quiz results: {set.topic}</h1>
        <p className="mt-2 text-sm text-slate-600">You scored {score} out of {set.materials.quiz.length}</p>

        <div className="mt-6 grid gap-4">
          {set.materials.quiz.map((item, index) => {
            const userAnswer = answers[index];
            const isCorrect = userAnswer === item.correctAnswer;

            return (
              <article key={item.question} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="font-semibold">{index + 1}. {item.question}</p>
                <p className={`mt-2 text-sm ${isCorrect ? "text-emerald-700" : "text-rose-700"}`}>
                  Your answer: {userAnswer ?? "No answer"}
                </p>
                {!isCorrect ? <p className="text-sm text-slate-700">Correct: {item.correctAnswer}</p> : null}
                <p className="mt-2 rounded-lg bg-slate-50 p-2 text-sm text-slate-700">{item.explanation}</p>
              </article>
            );
          })}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => {
              setAnswers({});
              setSelectedOption(null);
              setCheckedAnswers({});
              setCurrentIndex(0);
              setShowResults(false);
            }}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
          >
            Retry quiz
          </button>
          <Link href={`/revision-sets/${set.id}/plan`} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
            Go to revision plan
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <h1 className="text-2xl font-bold">Quiz: {set.topic}</h1>
      <p className="mt-1 text-sm text-slate-600">Question {currentIndex + 1} of {set.materials.quiz.length}</p>

      <article className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">{question.question}</h2>

        <div className="mt-4 grid gap-2">
          {question.options.map((option) => {
            const isSelected = hasAnswered ? selected === option : selectedOption === option;
            const isCorrect = option === question.correctAnswer;

            return (
              <button
                key={option}
                onClick={() => {
                  if (hasAnswered) return;
                  setSelectedOption(option);
                }}
                className={`rounded-lg border px-4 py-2 text-left text-sm transition ${
                  isSelected ? "border-indigo-500 bg-indigo-50" : "border-slate-300 hover:bg-slate-50"
                } ${hasAnswered && isCorrect ? "border-emerald-500 bg-emerald-50" : ""}`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {hasAnswered ? <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{question.explanation}</p> : null}
      </article>

      <div className="mt-6 flex justify-between">
        <button
          onClick={() => {
            setCurrentIndex((prev) => Math.max(prev - 1, 0));
            setSelectedOption(null);
          }}
          disabled={currentIndex === 0}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
        >
          Previous
        </button>

        {!hasAnswered ? (
          <button
            onClick={() => {
              if (!selectedOption) return;
              setAnswers((prev) => ({ ...prev, [currentIndex]: selectedOption }));
              setCheckedAnswers((prev) => ({ ...prev, [currentIndex]: true }));
            }}
            disabled={!selectedOption}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Check answer
          </button>
        ) : currentIndex === set.materials.quiz.length - 1 ? (
          <button
            onClick={() => setShowResults(true)}
            disabled={Object.keys(answers).length < set.materials.quiz.length}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Finish quiz
          </button>
        ) : (
          <button
            onClick={() => {
              setCurrentIndex((prev) => Math.min(prev + 1, set.materials.quiz.length - 1));
              setSelectedOption(null);
            }}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Next
          </button>
        )}
      </div>
    </AppShell>
  );
}

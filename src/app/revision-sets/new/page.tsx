"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/site-shell";
import { trackEvent } from "@/lib/analytics";
import { saveGeneratedRevision } from "@/lib/revision-data";
import { ExamLevel, GenerateRequest, GeneratedRevision } from "@/types/revision";

const examLevels: ExamLevel[] = ["GCSE", "A-Level", "University", "Other"];
const loadingMessages = [
  "Summarising your notes",
  "Making flashcards",
  "Building your quiz",
  "Planning your revision week",
];

export default function CreateRevisionSetPage() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [examLevel, setExamLevel] = useState<ExamLevel>("GCSE");
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    if (!isLoading) return;
    const interval = window.setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
    }, 1400);

    return () => window.clearInterval(interval);
  }, [isLoading]);

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    setNotes((prev) => (prev ? `${prev}\n\n${text}` : text));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (!subject.trim() || !topic.trim()) {
      setError("Please add a subject and topic before generating your revision pack.");
      return;
    }

    setIsLoading(true);

    const body: GenerateRequest = {
      subject: subject.trim(),
      examLevel,
      topic: topic.trim(),
      notes: notes.trim(),
    };

    try {
      const response = await fetch("/api/generate-revision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not generate revision materials.");
      }

      const generated = payload as GeneratedRevision & { warning?: string };
      if (generated.warning) {
        setNotice(generated.warning);
      }
      const savedSet = await saveGeneratedRevision({
        subject: body.subject,
        examLevel: body.examLevel,
        topic: body.topic,
        notes: body.notes,
        generated,
      });

      trackEvent("revision_set_generated", { revisionSetId: savedSet.id, examLevel: body.examLevel });
      router.push(`/revision-sets/${savedSet.id}/flashcards`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
      setLoadingStep(0);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold">Create revision set</h1>
        <p className="mt-2 text-sm text-slate-600">Paste notes, upload a text file, or type your topic to generate study materials.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input label="Subject" value={subject} onChange={setSubject} placeholder="Biology" />

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Exam level</span>
            <select
              value={examLevel}
              onChange={(e) => setExamLevel(e.target.value as ExamLevel)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-indigo-200 focus:ring"
            >
              {examLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>

          <Input label="Topic/title" value={topic} onChange={setTopic} placeholder="Cell division" />

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={8}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-indigo-200 focus:ring"
              placeholder="Paste notes here..."
            />
            <span className="mt-1 block text-xs text-slate-500">Minimum 100 characters ({notes.trim().length}/100)</span>
          </label>

          <label className="block text-sm font-medium">
            Upload text file
            <input type="file" accept=".txt" onChange={handleFileUpload} className="mt-1 block w-full text-sm" />
          </label>

          {error ? <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
          {notice ? <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">{notice}</p> : null}

          {isLoading ? (
            <div className="animate-soft-pulse rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-800">
              <p className="font-semibold">Creating your revision pack...</p>
              <p className="mt-1">{loadingMessages[loadingStep]}</p>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Generating revision materials..." : "Generate revision materials"}
          </button>
        </form>

        <Link href="/dashboard" className="mt-4 inline-flex text-sm font-semibold text-indigo-600 hover:text-indigo-700">
          Back to dashboard
        </Link>
      </div>
    </AppShell>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-indigo-200 focus:ring"
        placeholder={placeholder}
      />
    </label>
  );
}

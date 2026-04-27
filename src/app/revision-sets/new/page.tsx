"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AppShell } from "@/components/site-shell";
import { saveRevisionSet } from "@/lib/revision-storage";
import { ExamLevel, GenerateRequest, GeneratedMaterials, RevisionSet } from "@/types/revision";

const examLevels: ExamLevel[] = ["GCSE", "A-Level", "University", "Other"];

export default function CreateRevisionSetPage() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [examLevel, setExamLevel] = useState<ExamLevel>("GCSE");
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    setNotes((prev) => (prev ? `${prev}\n\n${text}` : text));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!subject || !topic || !notes) {
      setError("Please fill in subject, topic, and notes.");
      return;
    }

    setIsLoading(true);

    const body: GenerateRequest = { subject, examLevel, topic, notes };

    try {
      const response = await fetch("/api/generate-revision-materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Failed to generate revision materials.");
      }

      const materials = (await response.json()) as GeneratedMaterials;
      const newSet: RevisionSet = {
        id: crypto.randomUUID(),
        subject,
        examLevel,
        topic,
        notes,
        createdAt: new Date().toISOString(),
        materials,
      };

      saveRevisionSet(newSet);
      router.push(`/revision-sets/${newSet.id}/flashcards`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
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
          </label>

          <label className="block text-sm font-medium">
            Upload text file
            <input type="file" accept=".txt" onChange={handleFileUpload} className="mt-1 block w-full text-sm" />
          </label>

          {error ? <p className="rounded-lg bg-rose-50 p-2 text-sm text-rose-700">{error}</p> : null}

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

"use client";

import { getAccessToken } from "@/lib/auth-client";
import { getRevisionSetById, getRevisionSets, saveRevisionSet } from "@/lib/revision-storage";
import { GeneratedRevision, RevisionSet, RevisionSetSummary } from "@/types/revision";

type SaveInput = {
  subject: string;
  examLevel: string;
  topic: string;
  notes: string;
  generated: GeneratedRevision;
};

function toSummary(set: RevisionSet): RevisionSetSummary {
  return {
    id: set.id,
    subject: set.subject,
    topic: set.topic,
    createdAt: set.createdAt,
  };
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function loadRevisionSetSummaries(): Promise<RevisionSetSummary[]> {
  try {
    const response = await fetch("/api/revision-sets", {
      cache: "no-store",
      headers: await authHeaders(),
    });
    if (!response.ok) throw new Error("fallback");
    return (await response.json()) as RevisionSetSummary[];
  } catch {
    return getRevisionSets().map(toSummary);
  }
}

export async function loadRevisionSet(id: string): Promise<RevisionSet | null> {
  try {
    const response = await fetch(`/api/revision-sets/${id}`, {
      cache: "no-store",
      headers: await authHeaders(),
    });
    if (!response.ok) throw new Error("fallback");
    return (await response.json()) as RevisionSet;
  } catch {
    return getRevisionSetById(id);
  }
}

export async function saveGeneratedRevision(input: SaveInput): Promise<RevisionSet> {
  try {
    const response = await fetch("/api/revision-sets", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify(input),
    });

    const payload = await response.json();

    if (!response.ok) {
      const errorMessage = typeof payload?.error === "string" ? payload.error : "Could not save revision set.";
      throw new Error(errorMessage);
    }

    const saved = payload as RevisionSet;
    saveRevisionSet(saved);
    return saved;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save revision set.";

    if (message.includes("Free plan limit reached") || message.includes("Please log in")) {
      throw new Error(message);
    }

    const localSet: RevisionSet = {
      id: crypto.randomUUID(),
      subject: input.subject,
      examLevel: input.examLevel as RevisionSet["examLevel"],
      topic: input.topic,
      notes: input.notes,
      summary: input.generated.summary,
      createdAt: new Date().toISOString(),
      materials: input.generated,
    };

    saveRevisionSet(localSet);
    return localSet;
  }
}

export async function deleteRevisionSet(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/revision-sets/${id}`, {
      method: "DELETE",
      headers: await authHeaders(),
    });

    if (!response.ok) {
      throw new Error("fallback");
    }
  } catch {
    if (typeof window === "undefined") return;
    const next = getRevisionSets().filter((set) => set.id !== id);
    window.localStorage.setItem("examcrunch_revision_sets", JSON.stringify(next));
  }
}

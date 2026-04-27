"use client";

import { RevisionSet } from "@/types/revision";

const STORAGE_KEY = "examcrunch_revision_sets";

export function getRevisionSets(): RevisionSet[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as RevisionSet[];
    return parsed.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  } catch {
    return [];
  }
}

export function saveRevisionSet(newSet: RevisionSet): void {
  const all = getRevisionSets();
  const next = [newSet, ...all];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function getRevisionSetById(id: string): RevisionSet | null {
  const all = getRevisionSets();
  return all.find((item) => item.id === id) ?? null;
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/site-shell";
import { deleteRevisionSet, loadRevisionSetSummaries } from "@/lib/revision-data";
import { getAccessToken } from "@/lib/auth-client";
import { supabase, hasSupabaseConfig } from "@/lib/supabase";
import { RevisionSetSummary } from "@/types/revision";

type Activity = {
  event: string;
  timestamp: string;
};

type AccountInfo = {
  plan: "free" | "pro";
  isAdmin: boolean;
};

function getInitialActivities(): Activity[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem("examcrunch_analytics_events");
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as Activity[];
    return parsed.slice(0, 5);
  } catch {
    return [];
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [sets, setSets] = useState<RevisionSetSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [account, setAccount] = useState<AccountInfo>({ plan: "free", isAdmin: false });
  const [activities] = useState<Activity[]>(getInitialActivities);

  useEffect(() => {
    let mounted = true;

    loadRevisionSetSummaries().then((result) => {
      if (mounted) {
        setSets(result);
        setIsLoading(false);
      }
    });

    (async () => {
      const token = await getAccessToken();
      if (!token || !mounted) return;

      const response = await fetch("/api/account", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok || !mounted) return;
      const payload = (await response.json()) as AccountInfo;
      setAccount(payload);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const progressSummary = useMemo(() => {
    if (sets.length === 0) return "No revision sets yet.";
    if (sets.length === 1) return "1 revision set created.";
    return `${sets.length} revision sets created.`;
  }, [sets.length]);

  async function handleLogout() {
    if (!hasSupabaseConfig || !supabase) {
      router.push("/auth");
      return;
    }

    setIsLoggingOut(true);
    await supabase.auth.signOut();
    setIsLoggingOut(false);
    router.push("/auth");
  }

  async function handleDeleteSet(id: string) {
    await deleteRevisionSet(id);
    setSets((prev) => prev.filter((set) => set.id !== id));
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Your revision dashboard</h1>
          <p className="text-sm text-slate-600">{progressSummary}</p>
          <p className="mt-1 text-sm text-slate-700">
            Current plan: <span className="font-semibold uppercase">{account.isAdmin ? "Admin Pro" : account.plan}</span>
          </p>
        </div>
        <div className="flex gap-2">
          {account.plan !== "pro" && !account.isAdmin ? (
            <Link href="/pricing" className="rounded-xl border border-indigo-300 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">
              Upgrade to Pro
            </Link>
          ) : null}
          <Link href="/revision-sets/new" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
            Create new revision set
          </Link>
          <button onClick={handleLogout} disabled={isLoggingOut} className="rounded-xl border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-60">
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold">Saved revision sets</h2>
          <div className="mt-4 grid gap-4">
            {isLoading ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
                <p className="font-medium">Loading your revision sets...</p>
              </div>
            ) : sets.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <p className="font-medium">You have no revision sets yet.</p>
                <p className="mt-1 text-sm text-slate-600">Create your first revision pack to unlock flashcards, quizzes, and a 7-day plan.</p>
                <Link href="/revision-sets/new" className="mt-4 inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
                  Generate my first set
                </Link>
              </div>
            ) : (
              sets.map((set) => (
                <article key={set.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="text-lg font-semibold">{set.topic}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {set.subject} • {new Date(set.createdAt).toLocaleDateString()}
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
                    <button
                      type="button"
                      onClick={() => handleDeleteSet(set.id)}
                      className="rounded-lg border border-rose-300 px-3 py-1 text-rose-700 hover:bg-rose-50"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Recent activity</h2>
          {activities.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">No activity yet. Start by creating a revision set.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {activities.map((item, idx) => (
                <li key={`${item.event}-${idx}`} className="rounded-lg bg-slate-50 p-2">
                  <p className="font-medium">{item.event.replaceAll("_", " ")}</p>
                  <p className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </section>
    </AppShell>
  );
}

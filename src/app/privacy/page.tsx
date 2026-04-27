import { AppShell } from "@/components/site-shell";

export default function PrivacyPage() {
  return (
    <AppShell>
      <article className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold">Privacy</h1>
        <p className="mt-3 text-sm text-slate-700">
          ExamCrunch AI helps with revision planning. Avoid uploading highly sensitive personal data.
        </p>
        <p className="mt-2 text-sm text-slate-700">
          AI-generated content may be imperfect. Always review important answers before exams.
        </p>
      </article>
    </AppShell>
  );
}

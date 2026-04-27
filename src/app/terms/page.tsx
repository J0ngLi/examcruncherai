import { AppShell } from "@/components/site-shell";

export default function TermsPage() {
  return (
    <AppShell>
      <article className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold">Terms</h1>
        <p className="mt-3 text-sm text-slate-700">
          ExamCrunch AI is an educational revision helper. Use your own judgment when relying on generated materials.
        </p>
        <p className="mt-2 text-sm text-slate-700">
          Do not upload confidential or highly sensitive personal information.
        </p>
      </article>
    </AppShell>
  );
}

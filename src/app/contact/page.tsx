import { AppShell } from "@/components/site-shell";

export default function ContactPage() {
  return (
    <AppShell>
      <article className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold">Contact</h1>
        <p className="mt-3 text-sm text-slate-700">Need help with your account or subscription? Email: contact@example.com</p>
      </article>
    </AppShell>
  );
}

import Link from "next/link";
import { AppShell } from "@/components/site-shell";

export default function BillingCancelledPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold">Payment cancelled</h1>
        <p className="mt-3 text-sm text-slate-700">
          No worries - your payment was cancelled and no changes were made to your account.
        </p>
        <div className="mt-5 flex gap-3">
          <Link href="/pricing" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
            Try again
          </Link>
          <Link href="/dashboard" className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">
            Back to dashboard
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

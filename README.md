# ExamCrunch AI (Production Beta)

ExamCrunch AI turns notes into:
- A short summary
- Flashcards
- Multiple-choice quizzes with explanations
- A 7-day revision plan

## Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase (auth + database)
- OpenAI API (server-side generation)
- PayPal Subscriptions (monthly, optional yearly)

## Run locally

1. Install dependencies

```bash
npm install
```

2. Create `.env.local` from `.env.example`

3. Start the app

```bash
npm run dev
```

4. Visit [http://localhost:3000](http://localhost:3000)

## Required environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
FREE_PLAN_LIMIT=3
ADMIN_EMAILS=
BETA_DISABLE_PAYMENTS=false
APP_BASE_URL=
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_MONTHLY_PLAN_ID=
PAYPAL_YEARLY_PLAN_ID=
```

### Variable notes
- `FREE_PLAN_LIMIT`: max revision sets for free users (server-side enforced).
- `ADMIN_EMAILS`: comma-separated emails that bypass limits and are treated as Pro.
- `BETA_DISABLE_PAYMENTS=true`: disables checkout immediately.
- `APP_BASE_URL`: optional canonical app URL used for PayPal return/cancel links (example: `https://www.examcrunchai.com`).
- `PAYPAL_BASE_URL`:
  - Sandbox: `https://api-m.sandbox.paypal.com`
  - Live: `https://api-m.paypal.com`

## Supabase setup

1. Create a Supabase project.
2. Open SQL Editor and run `supabase/schema.sql`.
3. Add env vars:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

## OpenAI setup

1. Create an OpenAI API key.
2. Add `OPENAI_API_KEY`.
3. Restart the dev server.

## PayPal setup (exact dashboard requirements)

1. Create a PayPal Business sandbox account and developer app.
2. Set app credentials:
   - Client ID -> `PAYPAL_CLIENT_ID`
   - Secret -> `PAYPAL_CLIENT_SECRET`
3. In PayPal Subscriptions, create at least one plan:
   - Monthly plan ID -> `PAYPAL_MONTHLY_PLAN_ID`
4. Optional: create yearly plan:
   - Yearly plan ID -> `PAYPAL_YEARLY_PLAN_ID`
5. Configure webhook URL in PayPal app settings:
   - `https://<your-domain>/api/paypal/webhook`
6. Subscribe to webhook events:
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.UPDATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.EXPIRED`
   - `BILLING.SUBSCRIPTION.SUSPENDED`
7. For production, switch to live credentials and live API base URL.

## Auth, limits, and premium protection

- Protected pages: `/dashboard` and `/revision-sets/*` require auth when Supabase is configured.
- Revision APIs require bearer token and enforce ownership.
- Free plan limits are enforced server-side in `POST /api/revision-sets`.
- Pro/admin bypass free limits.

## Billing flow

- `POST /api/paypal/create-order` creates a PayPal subscription and returns approval URL.
- PayPal redirects user to:
  - `/billing/success`
  - `/billing/cancelled`
- `POST /api/paypal/capture-order` verifies subscription and upgrades user plan.
- `POST /api/paypal/webhook` keeps plan status in sync from PayPal events.

## Deploy on Vercel

1. Push repo to GitHub.
2. Import in Vercel.
3. Set all env vars in Vercel settings.
4. Deploy and configure custom domain.
5. Set PayPal webhook URL to deployed domain.

## Main pages
- `/`
- `/auth`
- `/dashboard`
- `/revision-sets/new`
- `/revision-sets/[id]/flashcards`
- `/revision-sets/[id]/quiz`
- `/revision-sets/[id]/plan`
- `/pricing`
- `/billing/success`
- `/billing/cancelled`

# ExamCrunch AI (MVP)

ExamCrunch AI helps students turn notes into:
- Flashcards
- Quiz questions
- A short summary
- A 7-day revision plan

## Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase-ready auth/data setup
- OpenAI API integration with mock fallback

## Run locally

```bash
npm install
npm run dev
```

## Environment variables

Copy `.env.example` to `.env.local` and fill in values when ready.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`

If `OPENAI_API_KEY` is missing, the app returns realistic mock output so MVP flow still works.

## Main pages
- `/` Landing page
- `/auth` Sign up / login (Supabase-ready)
- `/dashboard` Revision sets overview
- `/revision-sets/new` Create set + generate materials
- `/revision-sets/[id]/flashcards`
- `/revision-sets/[id]/quiz`
- `/revision-sets/[id]/plan`
- `/pricing`

## Database schema

See `supabase/schema.sql` for:
- `users`
- `revision_sets`
- `flashcards`
- `quiz_questions`
- `revision_plans`

-- ExamCrunch AI MVP schema (Supabase/Postgres)

create table if not exists users (
  id uuid primary key,
  email text unique not null,
  created_at timestamptz default now() not null
);

create table if not exists revision_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  subject text not null,
  exam_level text not null,
  topic text not null,
  notes text not null,
  summary text not null,
  created_at timestamptz default now() not null
);

create table if not exists flashcards (
  id bigserial primary key,
  revision_set_id uuid not null references revision_sets(id) on delete cascade,
  question text not null,
  answer text not null
);

create table if not exists quiz_questions (
  id bigserial primary key,
  revision_set_id uuid not null references revision_sets(id) on delete cascade,
  question text not null,
  options jsonb not null,
  correct_answer text not null
);

create table if not exists revision_plans (
  id bigserial primary key,
  revision_set_id uuid not null references revision_sets(id) on delete cascade,
  day int not null,
  focus text not null,
  tasks jsonb not null
);

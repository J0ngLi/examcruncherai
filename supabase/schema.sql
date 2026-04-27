-- ExamCrunch AI production-ready schema (Supabase/Postgres)

create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key,
  email text unique not null,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  is_admin boolean not null default false,
  created_at timestamptz default now() not null
);

create table if not exists revision_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
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
  correct_answer text not null,
  explanation text not null default ''
);

create table if not exists revision_plans (
  id bigserial primary key,
  revision_set_id uuid not null references revision_sets(id) on delete cascade,
  day int not null,
  task text not null,
  estimated_time text not null
);

create table if not exists paypal_subscriptions (
  id bigserial primary key,
  user_id uuid references users(id) on delete set null,
  paypal_subscription_id text unique,
  paypal_plan_id text,
  status text not null,
  payer_email text,
  event_source text not null,
  created_at timestamptz default now() not null
);

-- Rafli Life Tracker — initial schema for Supabase (PostgreSQL)
-- =============================================================
-- Multi-user ready. During Phase 1 only one seeded user is used
-- (id = "rafli-akbar") but every row already carries a user_id so
-- rolling out Supabase Auth later requires no data migration.
--
-- Run this against your Supabase project once you provide
-- NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY.

create extension if not exists "pgcrypto";

-- ---------- Users ----------
create table if not exists public.users (
    id            text primary key,                -- matches auth.uid() as text OR seed id
    full_name     text not null,
    headline      text,
    locale        text default 'id-ID',
    currency      text default 'IDR',
    target_role   text default 'Data Analyst',
    created_at    timestamptz default now()
);

-- ---------- Goals ----------
create table if not exists public.goals (
    id            text primary key default gen_random_uuid()::text,
    user_id       text not null references public.users(id) on delete cascade,
    area          text not null,        -- career | finance | skills | business | growth
    title         text not null,
    why           text,
    priority      text default 'medium',
    status        text default 'planned', -- planned | in_progress | completed | archived
    target_date   date,
    metric        jsonb,                -- { current, target, unit }
    contributions jsonb,                -- for career-goal breakdown
    milestones    jsonb,                -- savings ladder / step milestones
    progress      integer default 0,
    notes         text,
    created_at    timestamptz default now()
);
create index if not exists goals_user_idx on public.goals(user_id);
create index if not exists goals_status_idx on public.goals(status);

-- ---------- Career milestones ----------
create table if not exists public.career_milestones (
    id            text primary key default gen_random_uuid()::text,
    user_id       text not null references public.users(id) on delete cascade,
    title         text not null,
    type          text not null,        -- education | certificate | experience | project | skill | target
    month         integer,
    year          integer,
    organization  text,
    description   text,
    skills        text[] default '{}',
    evidence_url  text,
    status        text default 'planned', -- planned | in_progress | completed
    contribution  integer default 5,
    created_at    timestamptz default now()
);
create index if not exists cm_user_idx on public.career_milestones(user_id);
create index if not exists cm_time_idx on public.career_milestones(year, month);

-- ---------- Portfolio ----------
create table if not exists public.portfolio_projects (
    id            text primary key default gen_random_uuid()::text,
    user_id       text not null references public.users(id) on delete cascade,
    title         text not null,
    tools         text[] default '{}',
    status        text default 'in_progress', -- in_progress | shipped
    link          text,
    impact        text,
    case_study    text,
    created_at    timestamptz default now()
);
create index if not exists pf_user_idx on public.portfolio_projects(user_id);

-- ---------- Skills ----------
create table if not exists public.skills (
    id                text primary key default gen_random_uuid()::text,
    user_id           text not null references public.users(id) on delete cascade,
    name              text not null,
    category          text not null,
    level             integer default 1,
    target            integer default 5,
    momentum          integer default 20,
    related_to_role   boolean default false,
    last_practiced_at date,
    plan              text,
    resource_url      text,
    created_at        timestamptz default now()
);
create index if not exists sk_user_idx on public.skills(user_id);

-- ---------- Transactions ----------
create table if not exists public.transactions (
    id          text primary key default gen_random_uuid()::text,
    user_id     text not null references public.users(id) on delete cascade,
    title       text not null,
    type        text not null,          -- income | expense
    category    text not null,
    amount      numeric(14,2) not null,
    date        date not null,
    notes       text,
    recurring   boolean default false,
    attachment_url text,
    created_at  timestamptz default now()
);
create index if not exists tx_user_idx on public.transactions(user_id);
create index if not exists tx_date_idx on public.transactions(date desc);

-- ---------- Budgets ----------
create table if not exists public.budgets (
    id          text primary key default gen_random_uuid()::text,
    user_id     text not null references public.users(id) on delete cascade,
    category    text not null,
    "limit"     numeric(14,2) not null,
    month       text not null,          -- yyyy-MM
    unique (user_id, category, month)
);

-- ---------- Reminders ----------
create table if not exists public.reminders (
    id          text primary key default gen_random_uuid()::text,
    user_id     text not null references public.users(id) on delete cascade,
    title       text not null,
    amount      numeric(14,2),
    category    text not null,
    cadence     text default 'monthly', -- monthly | quarterly | yearly | once
    due_day     integer default 1,
    active      boolean default true,
    notes       text,
    created_at  timestamptz default now()
);

-- ---------- Commitments ----------
create table if not exists public.commitments (
    id          text primary key default gen_random_uuid()::text,
    user_id     text not null references public.users(id) on delete cascade,
    title       text not null,
    area        text default 'career',
    due_date    date,
    done        boolean default false,
    priority    text default 'medium',
    created_at  timestamptz default now()
);

-- ---------- Weekly reviews ----------
create table if not exists public.weekly_reviews (
    id                text primary key default gen_random_uuid()::text,
    user_id           text not null references public.users(id) on delete cascade,
    week_of           date not null,
    highlights        text,
    blockers          text,
    finance           text,
    career_progress   text,
    next_week_focus   text[] default '{}',
    created_at        timestamptz default now()
);

-- ---------- Notifications ----------
create table if not exists public.notifications (
    id          text primary key default gen_random_uuid()::text,
    user_id     text not null references public.users(id) on delete cascade,
    title       text not null,
    body        text,
    tone        text default 'info',    -- info | warning | success
    read        boolean default false,
    created_at  timestamptz default now()
);

-- ---------- Activity log ----------
create table if not exists public.activity_log (
    id          text primary key default gen_random_uuid()::text,
    user_id     text not null references public.users(id) on delete cascade,
    kind        text,
    message     text not null,
    created_at  timestamptz default now()
);
create index if not exists act_user_time on public.activity_log(user_id, created_at desc);

-- =============================================================
-- Row Level Security
-- =============================================================
alter table public.users             enable row level security;
alter table public.goals             enable row level security;
alter table public.career_milestones enable row level security;
alter table public.portfolio_projects enable row level security;
alter table public.skills            enable row level security;
alter table public.transactions      enable row level security;
alter table public.budgets           enable row level security;
alter table public.reminders         enable row level security;
alter table public.commitments       enable row level security;
alter table public.weekly_reviews    enable row level security;
alter table public.notifications     enable row level security;
alter table public.activity_log      enable row level security;

-- Policy template — access only own rows (using auth.uid()::text = user_id).
-- Adjust when Supabase Auth is enabled.
do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'goals', 'career_milestones', 'portfolio_projects', 'skills',
      'transactions', 'budgets', 'reminders', 'commitments',
      'weekly_reviews', 'notifications', 'activity_log'
    ])
  loop
    execute format('
      create policy "%1$s_owner_read"   on public.%1$s
        for select using (auth.uid()::text = user_id);
      create policy "%1$s_owner_write"  on public.%1$s
        for insert with check (auth.uid()::text = user_id);
      create policy "%1$s_owner_update" on public.%1$s
        for update using (auth.uid()::text = user_id);
      create policy "%1$s_owner_delete" on public.%1$s
        for delete using (auth.uid()::text = user_id);
    ', t);
  end loop;
end $$;

create policy "users_self_select" on public.users
  for select using (auth.uid()::text = id);
create policy "users_self_update" on public.users
  for update using (auth.uid()::text = id);

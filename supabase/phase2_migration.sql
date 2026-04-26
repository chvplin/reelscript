-- Phase 2 schema hardening for ReelScript AI.

create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  content_type text not null,
  visual_description text,
  song_context text,
  inputs jsonb default '{}'::jsonb,
  results jsonb not null,
  credits_used integer default 1,
  created_at timestamp default now()
);

create index if not exists idx_generations_user_created on public.generations(user_id, created_at desc);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  caption_text text not null,
  tags text[] default '{}'::text[],
  content_type text,
  copy_count integer default 0,
  created_at timestamp default now()
);

create index if not exists idx_favorites_user on public.favorites(user_id);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  generation_id uuid references public.generations(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  rating integer check (rating in (1, -1)),
  created_at timestamp default now()
);

create table if not exists public.subscription_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  event_type text not null,
  stripe_event_id text unique,
  payload jsonb,
  created_at timestamp default now()
);

alter table public.profiles add column if not exists monthly_reset_at timestamp;
alter table public.profiles add column if not exists stripe_customer_id text;
alter table public.profiles add column if not exists stripe_subscription_id text;
alter table public.generations add column if not exists inputs jsonb default '{}'::jsonb;
alter table public.subscription_events add column if not exists user_id uuid references public.profiles(id) on delete cascade;

alter table public.generations enable row level security;
alter table public.favorites enable row level security;
alter table public.feedback enable row level security;
alter table public.subscription_events enable row level security;

drop policy if exists "Users can view own generations" on public.generations;
create policy "Users can view own generations" on public.generations for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own generations" on public.generations;
create policy "Users can insert own generations" on public.generations for insert with check (auth.uid() = user_id);
drop policy if exists "Users can delete own generations" on public.generations;
create policy "Users can delete own generations" on public.generations for delete using (auth.uid() = user_id);

drop policy if exists "Users can manage own favorites" on public.favorites;
create policy "Users can manage own favorites" on public.favorites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can manage own feedback" on public.feedback;
create policy "Users can manage own feedback" on public.feedback for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

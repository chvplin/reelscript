create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  artist_name text not null,
  genre text,
  personality_settings jsonb default '{}'::jsonb,
  credits_remaining integer default 10,
  subscription_tier text default 'free',
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles for insert
with check (auth.uid() = id);

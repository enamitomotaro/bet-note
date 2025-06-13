-- Phase 1: DB schema for profiles and bet_entries

-- Enable extensions
create extension if not exists "uuid-ossp";

-- profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are editable by owner" on public.profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- bet_entries table
create table if not exists public.bet_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  race_name text not null,
  stake numeric not null,
  payout numeric,
  created_at timestamp with time zone default now()
);

alter table public.bet_entries enable row level security;

create policy "Entries are owned" on public.bet_entries
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

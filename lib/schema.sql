-- Run this in your Supabase SQL Editor
-- supabase.com → your project → SQL Editor → New query → paste → Run

-- Profiles table
create table if not exists profiles (
  id uuid default gen_random_uuid() primary key,
  clerk_user_id text unique not null,
  business_name text,
  business_type text,
  location text,
  website text,
  voice text default 'friendly and warm',
  offerings text,
  audience text,
  instagram text,
  facebook text,
  images jsonb default '[]'::jsonb,
  onboarding_complete boolean default false,
  plan text default 'trial',
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Content history table
create table if not exists content_history (
  id uuid default gen_random_uuid() primary key,
  clerk_user_id text not null,
  month text not null,
  year integer not null,
  raw_content text,
  sections jsonb default '{}'::jsonb,
  updates jsonb default '{}'::jsonb,
  content_type text default 'full',
  created_at timestamptz default now()
);

-- Indexes
create index if not exists profiles_clerk_id on profiles(clerk_user_id);
create index if not exists history_clerk_id on content_history(clerk_user_id);
create index if not exists history_date on content_history(clerk_user_id, year desc, month);

-- Enable RLS
alter table profiles enable row level security;
alter table content_history enable row level security;

-- RLS Policies (using service role from API routes bypasses these)
create policy "Users can read own profile"
  on profiles for select using (clerk_user_id = current_setting('app.clerk_user_id', true));

create policy "Users can update own profile"
  on profiles for update using (clerk_user_id = current_setting('app.clerk_user_id', true));

create policy "Users can read own history"
  on content_history for select using (clerk_user_id = current_setting('app.clerk_user_id', true));

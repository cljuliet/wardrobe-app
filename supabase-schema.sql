-- Run this in your Supabase project → SQL Editor → New Query
-- Creates a key/value store per user with row-level security

create table if not exists wardrobe_data (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  key        text not null,
  value      jsonb not null,
  updated_at timestamptz default now(),
  unique(user_id, key)
);

-- Row level security: each user can only see/edit their own rows
alter table wardrobe_data enable row level security;

create policy "Users access own data only"
  on wardrobe_data for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Supabase Setup for Cryptocurrency Explorer
-- Run this SQL in your Supabase SQL Editor

-- Create the favorites table
create table if not exists favorites (
  id uuid default uuid_generate_v4() primary key,
  asset_id text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add index for better query performance
create index if not exists idx_favorites_asset_id on favorites(asset_id);

-- IMPORTANT: Disable Row Level Security for demo purposes
-- This allows the anon key to read/write without authentication
alter table favorites disable row level security;

-- Alternative: If you want to keep RLS enabled, use these policies instead:
-- alter table favorites enable row level security;
-- 
-- create policy "Enable read access for all users" on favorites
--   for select
--   using (true);
-- 
-- create policy "Enable insert access for all users" on favorites
--   for insert
--   with check (true);
-- 
-- create policy "Enable delete access for all users" on favorites
--   for delete
--   using (true);

-- Verify the table was created
-- select * from favorites;

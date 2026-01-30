-- Create a public users table to manage app-specific user data
-- This table mirrors the auth.users table but adds our own fields for trial management

create table if not exists public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  trial_start_date timestamp with time zone default now(),
  trial_ends_at timestamp with time zone default (now() + interval '14 days'),
  status text default 'trial', -- 'trial', 'active', 'expired', 'banned'
  is_admin boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;

-- Policies

-- 1. Users can view their own data
create policy "Users can view own profile"
  on public.users for select
  using ( auth.uid() = id );

-- 2. Users can update their own data
create policy "Users can update own profile"
  on public.users for update
  using ( auth.uid() = id );

-- 3. Admins can view ALL data
create policy "Admins can view all profiles"
  on public.users for select
  using ( 
    (select is_admin from public.users where id = auth.uid()) = true 
  );

-- 4. Admins can update ALL data
create policy "Admins can update all profiles"
  on public.users for update
  using ( 
    (select is_admin from public.users where id = auth.uid()) = true 
  );

-- Trigger to automatically create a user entry on sign up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Drop and recreate trigger to ensure it's up to date
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- IMPORTANT: Set the first user (YOU) as admin manually after running this script
-- update public.users set is_admin = true where email = 'your-email@example.com';

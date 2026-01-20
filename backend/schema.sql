-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES TABLE (Role Management)
create table profiles (
  id uuid references auth.users not null primary key,
  email text not null,
  role text not null check (role in ('admin', 'user')) default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS
alter table profiles enable row level security;

-- Policies for profiles
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- NOTES TABLE
create table notes (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  subject text not null,
  price numeric not null check (price >= 10),
  file_url text not null, -- Secured PDF URL
  preview_url text not null, -- Public preview Image/PDF URL
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS
alter table notes enable row level security;

-- Policies for notes
create policy "Notes are viewable by everyone." on notes
  for select using (is_active = true);

create policy "Admins can insert notes." on notes
  for insert with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update notes." on notes
  for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- PURCHASES TABLE
create table purchases (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  note_id uuid references notes not null,
  payment_id text not null,
  order_id text not null,
  amount numeric not null,
  status text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS
alter table purchases enable row level security;

-- Policies for purchases
create policy "Users can view their own purchases." on purchases
  for select using (auth.uid() = user_id);

create policy "Admins can view all purchases." on purchases
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- TRIGGER for handling new user signup to create profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- SUBSCRIPTIONS TABLE
create table subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  plan_type text not null default 'pro', -- 'pro'
  start_date timestamp with time zone default timezone('utc'::text, now()) not null,
  end_date timestamp with time zone not null,
  payment_id text not null,
  order_id text not null,
  amount numeric not null,
  status text not null, -- 'active', 'expired'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS
alter table subscriptions enable row level security;

-- Policies for subscriptions
create policy "Users can view their own subscriptions." on subscriptions
  for select using (auth.uid() = user_id);

create policy "Admins can view all subscriptions." on subscriptions
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

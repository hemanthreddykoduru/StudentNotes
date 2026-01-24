-- SUPPORT MESSAGES TABLE
create table support_messages (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text not null default 'unread', -- 'unread', 'read'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS
alter table support_messages enable row level security;

-- Policies
create policy "Anyone can insert support messages." on support_messages
  for insert with check (true);

create policy "Admins can view support messages." on support_messages
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update support messages." on support_messages
  for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete support messages." on support_messages
  for delete using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

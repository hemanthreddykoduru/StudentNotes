-- APP CONFIG TABLE (For Global Settings)
create table app_config (
  key text primary key,
  value jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table app_config enable row level security;

-- Policies
create policy "Everyone can view config." on app_config
  for select using (true);

create policy "Admins can update config." on app_config
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Insert Default Subscription Price (₹100)
insert into app_config (key, value) values ('subscription_price', '100');

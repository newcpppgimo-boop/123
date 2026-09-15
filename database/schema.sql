create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role text not null default 'youth' check (role in ('youth','sk_officer')),
  created_at timestamptz not null default now()
);

create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  category text not null check (category in ('News','Events','Projects','Emergency Notice')),
  image_url text,
  created_by uuid not null references profiles(id),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  date date not null,
  time time not null,
  location text not null,
  max_participants integer not null check (max_participants > 0),
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  registration_date timestamptz not null default now(),
  attendance_status text not null default 'pending' check (attendance_status in ('pending','present','absent')),
  unique(event_id,user_id)
);

create table if not exists youth_voice (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null check (type in ('suggestion','concern')),
  category text not null,
  message text not null check (length(message) between 1 and 2000),
  anonymous boolean not null default false,
  status text not null default 'pending' check (status in ('pending','reviewing','resolved','rejected')),
  admin_response text,
  created_at timestamptz not null default now()
);

create table if not exists polls (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  question text not null,
  status text not null default 'active' check (status in ('active','closed')),
  start_date date not null,
  end_date date not null,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create table if not exists poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references polls(id) on delete cascade,
  option_text text not null
);

create table if not exists poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references polls(id) on delete cascade,
  option_id uuid not null references poll_options(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(poll_id,user_id)
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_announcements_created_at on announcements(created_at desc);
create index if not exists idx_events_date on events(date);
create index if not exists idx_registrations_event on event_registrations(event_id);
create index if not exists idx_voice_user on youth_voice(user_id);
create index if not exists idx_votes_poll on poll_votes(poll_id);
create index if not exists idx_notifications_user on notifications(user_id);

-- Automatically create a youth profile after Supabase Auth signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles(id,full_name,email,role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name','Youth User'), new.email, 'youth');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

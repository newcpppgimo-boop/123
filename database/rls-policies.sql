-- Run schema.sql first.
alter table profiles enable row level security;
alter table announcements enable row level security;
alter table events enable row level security;
alter table event_registrations enable row level security;
alter table youth_voice enable row level security;
alter table polls enable row level security;
alter table poll_options enable row level security;
alter table poll_votes enable row level security;
alter table notifications enable row level security;

create or replace function public.is_officer()
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from profiles where id=auth.uid() and role='sk_officer'); $$;

drop policy if exists "profiles own select" on profiles;
create policy "profiles own select" on profiles for select using (id=auth.uid() or public.is_officer());

drop policy if exists "officers manage profiles" on profiles;
create policy "officers manage profiles" on profiles for all using (public.is_officer()) with check (public.is_officer());

drop policy if exists "public published announcements" on announcements;
create policy "public published announcements" on announcements for select using (published=true or public.is_officer());
drop policy if exists "officers manage announcements" on announcements;
create policy "officers manage announcements" on announcements for all using (public.is_officer()) with check (public.is_officer());

drop policy if exists "public events" on events;
create policy "public events" on events for select using (true);
drop policy if exists "officers manage events" on events;
create policy "officers manage events" on events for all using (public.is_officer()) with check (public.is_officer());

drop policy if exists "users own registrations" on event_registrations;
create policy "users own registrations" on event_registrations for select using (user_id=auth.uid() or public.is_officer());
drop policy if exists "users create own registration" on event_registrations;
create policy "users create own registration" on event_registrations for insert with check (user_id=auth.uid());
drop policy if exists "officers manage registrations" on event_registrations;
create policy "officers manage registrations" on event_registrations for update using (public.is_officer()) with check (public.is_officer());
create policy "officers delete registrations" on event_registrations for delete using (public.is_officer());

drop policy if exists "users own voice" on youth_voice;
create policy "users own voice" on youth_voice for select using (user_id=auth.uid() or public.is_officer());
create policy "users create own voice" on youth_voice for insert with check (user_id=auth.uid());
create policy "officers manage voice" on youth_voice for update using (public.is_officer()) with check (public.is_officer());
create policy "officers delete voice" on youth_voice for delete using (public.is_officer());

drop policy if exists "public active polls" on polls;
create policy "public active polls" on polls for select using (status='active' or public.is_officer());
create policy "officers manage polls" on polls for all using (public.is_officer()) with check (public.is_officer());

create policy "poll options public select" on poll_options for select using (exists(select 1 from polls p where p.id=poll_id and (p.status='active' or public.is_officer())));
create policy "officers manage options" on poll_options for all using (public.is_officer()) with check (public.is_officer());

create policy "users own votes" on poll_votes for select using (user_id=auth.uid() or public.is_officer());
create policy "users create own vote" on poll_votes for insert with check (user_id=auth.uid() and exists(select 1 from polls p where p.id=poll_id and p.status='active') and exists(select 1 from poll_options o where o.id=option_id and o.poll_id=poll_id));
create policy "officers manage votes" on poll_votes for all using (public.is_officer()) with check (public.is_officer());

create policy "users own notifications" on notifications for select using (user_id=auth.uid() or public.is_officer());
create policy "users update own notifications" on notifications for update using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "officers manage notifications" on notifications for all using (public.is_officer()) with check (public.is_officer());

-- ============================================================================
-- Huawei Events — Supabase schema
-- Run this whole file in the Supabase SQL Editor (Dashboard -> SQL -> New query).
-- Then run supabase/seed.sql for sample data.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Profiles (one row per auth user; is_admin grants access to the admin panel)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Admin helper: is the current user an admin?
-- NOTE: must come AFTER the profiles table, because SQL-language function
-- bodies are parsed when the function is created.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  );
$$;

alter table public.profiles enable row level security;

drop policy if exists "profiles: owner or admin can read" on public.profiles;
create policy "profiles: owner or admin can read"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles: admin can update" on public.profiles;
create policy "profiles: admin can update"
  on public.profiles for update
  using (public.is_admin());

-- Automatically create a profile when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Events
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  tagline text,
  description text not null default '',
  cover_image_url text,
  venue text,
  city text not null default 'Minna',
  start_time timestamptz not null,
  end_time timestamptz,
  capacity integer,
  price numeric not null default 0,
  organizer text not null default 'Huawei',
  category text check (category in ('Bootcamp','Hackathon','Workshop','Talk','Meetup','Competition','Other')),
  status text not null default 'published'
    check (status in ('draft','published','cancelled','completed')),
  click_count bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists events_status_start_idx on public.events (status, start_time);
create index if not exists events_slug_idx on public.events (slug);

alter table public.events enable row level security;

drop policy if exists "events: public can read published" on public.events;
create policy "events: public can read published"
  on public.events for select
  using (status = 'published');

drop policy if exists "events: admin can read all" on public.events;
create policy "events: admin can read all"
  on public.events for select
  using (public.is_admin());

drop policy if exists "events: admin can insert" on public.events;
create policy "events: admin can insert"
  on public.events for insert
  with check (public.is_admin());

drop policy if exists "events: admin can update" on public.events;
create policy "events: admin can update"
  on public.events for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "events: admin can delete" on public.events;
create policy "events: admin can delete"
  on public.events for delete
  using (public.is_admin());

-- Keep updated_at fresh on edits
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
  before update on public.events
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Registrations (attendees do NOT need accounts)
-- ---------------------------------------------------------------------------
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  matric_number text,
  department text,
  level text,
  notes text,
  status text not null default 'confirmed'
    check (status in ('confirmed','waitlisted','cancelled','checked_in')),
  created_at timestamptz not null default now()
);

create index if not exists registrations_event_idx on public.registrations (event_id);
create index if not exists registrations_event_email_idx on public.registrations (event_id, email);

alter table public.registrations enable row level security;

drop policy if exists "registrations: anyone can register" on public.registrations;
create policy "registrations: anyone can register"
  on public.registrations for insert
  with check (true);

drop policy if exists "registrations: admin can read" on public.registrations;
create policy "registrations: admin can read"
  on public.registrations for select
  using (public.is_admin());

drop policy if exists "registrations: admin can update" on public.registrations;
create policy "registrations: admin can update"
  on public.registrations for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "registrations: admin can delete" on public.registrations;
create policy "registrations: admin can delete"
  on public.registrations for delete
  using (public.is_admin());

-- Confirmed-registration counts per event (used for "spots left" badges).
-- Runs as the view owner so public visitors can see aggregate counts only.
create or replace view public.event_registration_counts as
  select
    e.id as event_id,
    count(r.id) filter (where r.status = 'confirmed')::int as confirmed_count,
    count(r.id) filter (where r.status = 'waitlisted')::int as waitlisted_count
  from public.events e
  left join public.registrations r on r.event_id = e.id
  group by e.id;

-- ---------------------------------------------------------------------------
-- Register for an event (atomic capacity / waitlist logic)
-- ---------------------------------------------------------------------------
create or replace function public.register_for_event(
  p_event_id uuid,
  p_full_name text,
  p_email text,
  p_phone text default null,
  p_matric_number text default null,
  p_department text default null,
  p_level text default null,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_capacity int;
  v_count int;
  v_status text;
  v_existing uuid;
  v_waitlist_position int;
begin
  -- Lock the event row so capacity checks are serialised per event.
  select capacity
    into v_capacity
    from public.events
    where id = p_event_id
    for update;

  if not found then
    raise exception 'EVENT_NOT_FOUND';
  end if;

  select id
    into v_existing
    from public.registrations
    where event_id = p_event_id
      and lower(email) = lower(p_email);

  if v_existing is not null then
    raise exception 'ALREADY_REGISTERED';
  end if;

  if v_capacity is null then
    v_status := 'confirmed';
  else
    select count(*)
      into v_count
      from public.registrations
      where event_id = p_event_id and status = 'confirmed';

    if v_count < v_capacity then
      v_status := 'confirmed';
    else
      v_status := 'waitlisted';
    end if;
  end if;

  insert into public.registrations (
    event_id, full_name, email, phone, matric_number,
    department, level, notes, status
  )
  values (
    p_event_id, p_full_name, p_email, p_phone, p_matric_number,
    p_department, p_level, p_notes, v_status
  )
  returning id into v_existing;

  if v_status = 'waitlisted' then
    select count(*)
      into v_waitlist_position
      from public.registrations
      where event_id = p_event_id and status = 'waitlisted';
  else
    v_waitlist_position := 0;
  end if;

  return jsonb_build_object(
    'registration_id', v_existing,
    'status', v_status,
    'waitlist_position', v_waitlist_position
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Count clicks on short share links
-- ---------------------------------------------------------------------------
create or replace function public.increment_event_clicks(p_slug text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.events
    set click_count = click_count + 1
    where slug = p_slug;
$$;

-- Esquema base: perfiles, complejos, canchas, horarios, reservas y partidos.

create extension if not exists pgcrypto;

-- profiles ------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  role text not null default 'client' check (role in ('client', 'complex_admin', 'super_admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Evita que un usuario se auto-asigne un rol mayor editando su propio perfil.
create function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and auth.role() <> 'service_role' then
    new.role := old.role;
  end if;
  return new;
end;
$$;

create trigger protect_profile_role_trigger
  before update on public.profiles
  for each row execute function public.protect_profile_role();

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- complexes -------------------------------------------------------------
create table public.complexes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  address text,
  lat double precision,
  lng double precision,
  phone text,
  cover_image_url text,
  is_active boolean not null default true,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index complexes_lat_lng_idx on public.complexes (lat, lng);

create trigger set_updated_at before update on public.complexes
  for each row execute function public.set_updated_at();

-- complex_admins ----------------------------------------------------------
create table public.complex_admins (
  id uuid primary key default gen_random_uuid(),
  complex_id uuid not null references public.complexes (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (complex_id, user_id)
);

-- sports ------------------------------------------------------------------
create table public.sports (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  icon text
);

-- courts --------------------------------------------------------------------
create table public.courts (
  id uuid primary key default gen_random_uuid(),
  complex_id uuid not null references public.complexes (id) on delete cascade,
  sport_id uuid not null references public.sports (id),
  name text not null,
  variant text,
  surface text,
  is_indoor boolean not null default false,
  is_active boolean not null default true,
  price_per_hour numeric(10, 2),
  default_capacity smallint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index courts_complex_id_idx on public.courts (complex_id);

create trigger set_updated_at before update on public.courts
  for each row execute function public.set_updated_at();

-- operating_hours -------------------------------------------------------------
create table public.operating_hours (
  id uuid primary key default gen_random_uuid(),
  court_id uuid not null references public.courts (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  open_time time not null,
  close_time time not null,
  check (close_time > open_time)
);

create index operating_hours_court_id_idx on public.operating_hours (court_id);

-- blackout_dates ----------------------------------------------------------------
create table public.blackout_dates (
  id uuid primary key default gen_random_uuid(),
  complex_id uuid not null references public.complexes (id) on delete cascade,
  court_id uuid references public.courts (id) on delete cascade,
  date date not null,
  all_day boolean not null default true,
  start_time time,
  end_time time,
  reason text,
  created_at timestamptz not null default now()
);

create index blackout_dates_complex_id_idx on public.blackout_dates (complex_id);
create index blackout_dates_court_id_idx on public.blackout_dates (court_id);

-- reservations ----------------------------------------------------------------
create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  court_id uuid not null references public.courts (id),
  user_id uuid not null references public.profiles (id),
  date date not null,
  start_time time not null,
  end_time time not null,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  type text not null default 'private' check (type in ('private', 'match')),
  price numeric(10, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Garantía dura anti-doble-reserva: dos reservas confirmadas no pueden
-- compartir cancha+fecha+hora.
create unique index reservations_slot_unique_idx
  on public.reservations (court_id, date, start_time)
  where status = 'confirmed';

create index reservations_user_id_idx on public.reservations (user_id);
create index reservations_court_date_idx on public.reservations (court_id, date);

create trigger set_updated_at before update on public.reservations
  for each row execute function public.set_updated_at();

-- matches -----------------------------------------------------------------------
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null unique references public.reservations (id) on delete cascade,
  target_players smallint not null check (target_players >= 2),
  status text not null default 'open' check (status in ('open', 'full', 'cancelled', 'completed')),
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

-- match_participants --------------------------------------------------------------
create table public.match_participants (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  user_id uuid not null references public.profiles (id),
  status text not null default 'joined' check (status in ('joined', 'left')),
  joined_at timestamptz not null default now()
);

-- Un usuario solo puede tener una fila "joined" activa por partido; puede
-- reunirse después de haber dejado el partido (nueva fila).
create unique index match_participants_unique_active_idx
  on public.match_participants (match_id, user_id)
  where status = 'joined';

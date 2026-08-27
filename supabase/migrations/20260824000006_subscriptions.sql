-- Suscripciones de plataforma: el super-admin define el precio de la
-- mensualidad y registra pagos a mano (sin pasarela de pago en el MVP).
-- Un complejo vencido deja de ser visible para clientes automáticamente
-- (se compara la fecha en cada policy/RPC), sin afectar el acceso del
-- propio admin a su panel para poder pagar y reactivarse.

create table public.platform_settings (
  id boolean primary key default true,
  monthly_price numeric(10, 2) not null default 0,
  constraint platform_settings_singleton check (id)
);

insert into public.platform_settings (id, monthly_price) values (true, 0);

alter table public.complexes add column subscription_expires_at date;

create table public.subscription_payments (
  id uuid primary key default gen_random_uuid(),
  complex_id uuid not null references public.complexes (id) on delete cascade,
  amount numeric(10, 2) not null,
  months smallint not null default 1,
  period_start date not null,
  period_end date not null,
  recorded_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create index subscription_payments_complex_id_idx on public.subscription_payments (complex_id);

-- subscription_expires_at is null => todavía no se empezó a trackear el
-- pago de ese complejo (ej. viejo o exento): se considera activo. Una vez
-- que tiene una fecha, se compara contra hoy.
create or replace function public.is_subscription_active(target_complex_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select subscription_expires_at is null or subscription_expires_at >= current_date
      from public.complexes
      where id = target_complex_id
    ),
    false
  );
$$;

-- record_subscription_payment ------------------------------------------------------
-- Extiende el vencimiento `months` meses desde el mayor entre "hoy" y el
-- vencimiento actual (pagar antes de tiempo no desperdicia días; pagar tarde
-- no regala los días de mora).
create or replace function public.record_subscription_payment(
  target_complex_id uuid,
  amount numeric,
  months smallint default 1
)
returns date
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_expiry date;
  v_period_start date;
  v_new_expiry date;
begin
  if not public.is_super_admin() then
    raise exception 'No autorizado.';
  end if;

  select subscription_expires_at into v_current_expiry
  from public.complexes
  where id = target_complex_id;

  v_period_start := greatest(coalesce(v_current_expiry, current_date), current_date);
  v_new_expiry := (v_period_start + (months || ' months')::interval)::date;

  update public.complexes
  set subscription_expires_at = v_new_expiry
  where id = target_complex_id;

  insert into public.subscription_payments (complex_id, amount, months, period_start, period_end, recorded_by)
  values (target_complex_id, amount, months, v_period_start, v_new_expiry, auth.uid());

  return v_new_expiry;
end;
$$;

grant execute on function public.record_subscription_payment(uuid, numeric, smallint) to authenticated;

-- RLS: platform_settings y subscription_payments -----------------------------------
alter table public.platform_settings enable row level security;
alter table public.subscription_payments enable row level security;

create policy "platform_settings_select" on public.platform_settings
  for select using (true);

create policy "platform_settings_update_super_admin" on public.platform_settings
  for update using (public.is_super_admin());

create policy "subscription_payments_select" on public.subscription_payments
  for select using (public.is_super_admin() or public.is_complex_admin(complex_id));

-- Sin insert/update/delete directo: todo pasa por record_subscription_payment().

-- Reforzar policies de visibilidad pública con el estado de la suscripción ----------
drop policy "complexes_select" on public.complexes;
create policy "complexes_select" on public.complexes
  for select using (
    (is_active and public.is_subscription_active(id))
    or public.is_super_admin()
    or public.is_complex_admin(id)
  );

drop policy "courts_select" on public.courts;
create policy "courts_select" on public.courts
  for select using (
    exists (
      select 1 from public.complexes c
      where c.id = complex_id and c.is_active and public.is_subscription_active(c.id)
    )
    or public.is_super_admin()
    or public.is_complex_admin(complex_id)
  );

drop policy "operating_hours_select" on public.operating_hours;
create policy "operating_hours_select" on public.operating_hours
  for select using (
    exists (
      select 1 from public.courts co
      join public.complexes c on c.id = co.complex_id
      where co.id = court_id
        and (
          (c.is_active and public.is_subscription_active(c.id))
          or public.is_super_admin()
          or public.is_complex_admin(c.id)
        )
    )
  );

drop policy "blackout_dates_select" on public.blackout_dates;
create policy "blackout_dates_select" on public.blackout_dates
  for select using (
    exists (
      select 1 from public.complexes c
      where c.id = complex_id
        and (
          (c.is_active and public.is_subscription_active(c.id))
          or public.is_super_admin()
          or public.is_complex_admin(c.id)
        )
    )
  );

-- nearby_complexes: no listar complejos vencidos -----------------------------------
create or replace function public.nearby_complexes(
  user_lat double precision,
  user_lng double precision,
  radius_km double precision default 25
)
returns table (
  id uuid,
  name text,
  address text,
  lat double precision,
  lng double precision,
  cover_image_url text,
  distance_km double precision
)
language sql
stable
security definer
set search_path = public
as $$
  with bbox as (
    select
      user_lat - (radius_km / 111.0) as min_lat,
      user_lat + (radius_km / 111.0) as max_lat,
      user_lng - (radius_km / (111.0 * cos(radians(user_lat)))) as min_lng,
      user_lng + (radius_km / (111.0 * cos(radians(user_lat)))) as max_lng
  ),
  candidates as (
    select
      c.id, c.name, c.address, c.lat, c.lng, c.cover_image_url,
      6371 * acos(
        least(1.0, greatest(-1.0,
          cos(radians(user_lat)) * cos(radians(c.lat)) * cos(radians(c.lng) - radians(user_lng))
          + sin(radians(user_lat)) * sin(radians(c.lat))
        ))
      ) as distance_km
    from public.complexes c, bbox
    where c.is_active
      and public.is_subscription_active(c.id)
      and c.lat is not null and c.lng is not null
      and c.lat between bbox.min_lat and bbox.max_lat
      and c.lng between bbox.min_lng and bbox.max_lng
  )
  select * from candidates
  where distance_km <= radius_km
  order by distance_km asc;
$$;

-- create_reservation: no reservar en un complejo vencido ---------------------------
create or replace function public.create_reservation(
  target_court_id uuid,
  target_date date,
  target_start_time time,
  reservation_type text default 'private',
  match_target_players smallint default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_end_time time := target_start_time + interval '1 hour';
  v_dow smallint := extract(dow from target_date);
  v_complex_id uuid;
  v_price numeric(10, 2);
  v_reservation_id uuid;
  v_match_id uuid;
begin
  if v_user_id is null then
    raise exception 'Debés iniciar sesión para reservar.';
  end if;

  if reservation_type not in ('private', 'match') then
    raise exception 'Tipo de reserva inválido.';
  end if;

  if reservation_type = 'match' and (match_target_players is null or match_target_players < 2) then
    raise exception 'Un partido necesita al menos 2 jugadores objetivo.';
  end if;

  select price_per_hour, complex_id into v_price, v_complex_id
  from public.courts
  where id = target_court_id and is_active;

  if not found then
    raise exception 'La cancha no existe o no está activa.';
  end if;

  if not public.is_subscription_active(v_complex_id) then
    raise exception 'Este complejo no está disponible para reservas en este momento.';
  end if;

  if not exists (
    select 1 from public.operating_hours oh
    where oh.court_id = target_court_id
      and oh.day_of_week = v_dow
      and target_start_time >= oh.open_time
      and v_end_time <= oh.close_time
  ) then
    raise exception 'Ese horario está fuera del horario de atención de la cancha.';
  end if;

  if exists (
    select 1 from public.blackout_dates bd
    where bd.date = target_date
      and (bd.court_id = target_court_id or (bd.court_id is null and bd.complex_id = v_complex_id))
      and (bd.all_day or (target_start_time < bd.end_time and v_end_time > bd.start_time))
  ) then
    raise exception 'Ese horario no está disponible (bloqueado por el complejo).';
  end if;

  insert into public.reservations (court_id, user_id, date, start_time, end_time, type, price)
  values (target_court_id, v_user_id, target_date, target_start_time, v_end_time, reservation_type, v_price)
  returning id into v_reservation_id;

  if reservation_type = 'match' then
    insert into public.matches (reservation_id, target_players, created_by)
    values (v_reservation_id, match_target_players, v_user_id)
    returning id into v_match_id;

    insert into public.match_participants (match_id, user_id, status)
    values (v_match_id, v_user_id, 'joined');
  end if;

  return v_reservation_id;
exception
  when unique_violation then
    raise exception 'Ese horario ya fue reservado. Elegí otro.';
end;
$$;

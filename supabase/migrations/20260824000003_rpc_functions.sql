-- Funciones RPC: toda escritura sensible a condiciones de carrera (reservar
-- un slot, unirse a un partido) pasa por acá en vez de por insert directo.

-- nearby_complexes ------------------------------------------------------------
-- Bounding-box + Haversine en SQL. Sin PostGIS por ahora (MVP); si el volumen
-- de complejos crece, este es el punto de upgrade a geography+GiST.
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
      and c.lat is not null and c.lng is not null
      and c.lat between bbox.min_lat and bbox.max_lat
      and c.lng between bbox.min_lng and bbox.max_lng
  )
  select * from candidates
  where distance_km <= radius_km
  order by distance_km asc;
$$;

grant execute on function public.nearby_complexes(double precision, double precision, double precision) to anon, authenticated;

-- get_available_slots ----------------------------------------------------------
-- Devuelve solo los horarios ocupados de una cancha en una fecha (nunca quién
-- reservó); el cliente cruza esto con operating_hours para armar la grilla.
create or replace function public.get_available_slots(
  target_court_id uuid,
  target_date date
)
returns table (start_time time)
language sql
stable
security definer
set search_path = public
as $$
  select r.start_time
  from public.reservations r
  where r.court_id = target_court_id
    and r.date = target_date
    and r.status = 'confirmed';
$$;

grant execute on function public.get_available_slots(uuid, date) to anon, authenticated;

-- create_reservation -------------------------------------------------------------
-- Valida horario de atención + blackout dates e inserta la reserva (y el
-- partido, si aplica) en una transacción. El índice único parcial en
-- reservations es la garantía dura: si dos usuarios reservan el mismo slot
-- a la vez, el segundo recibe unique_violation acá abajo.
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

grant execute on function public.create_reservation(uuid, date, time, text, smallint) to authenticated;

-- cancel_reservation --------------------------------------------------------------
create or replace function public.cancel_reservation(target_reservation_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_owner uuid;
  v_court_id uuid;
begin
  select user_id, court_id into v_owner, v_court_id
  from public.reservations
  where id = target_reservation_id and status = 'confirmed';

  if not found then
    raise exception 'La reserva no existe o ya está cancelada.';
  end if;

  if v_owner <> v_user_id
     and not public.is_super_admin()
     and not exists (
       select 1 from public.courts co
       where co.id = v_court_id and public.is_complex_admin(co.complex_id)
     )
  then
    raise exception 'No tenés permiso para cancelar esta reserva.';
  end if;

  update public.reservations set status = 'cancelled' where id = target_reservation_id;
  update public.matches set status = 'cancelled' where reservation_id = target_reservation_id;
end;
$$;

grant execute on function public.cancel_reservation(uuid) to authenticated;

-- join_match ------------------------------------------------------------------------
-- SELECT ... FOR UPDATE serializa los joins concurrentes: el segundo caller
-- que intenta tomar el último cupo espera el lock y ve el conteo ya actualizado,
-- en vez de un check-then-insert que permitiría overbooking.
create or replace function public.join_match(target_match_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_target_players smallint;
  v_status text;
  v_joined_count int;
begin
  if v_user_id is null then
    raise exception 'Debés iniciar sesión para unirte a un partido.';
  end if;

  select target_players, status into v_target_players, v_status
  from public.matches
  where id = target_match_id
  for update;

  if not found then
    raise exception 'El partido no existe.';
  end if;

  if v_status <> 'open' then
    raise exception 'Ese partido ya no admite jugadores.';
  end if;

  select count(*) into v_joined_count
  from public.match_participants
  where match_id = target_match_id and status = 'joined';

  if v_joined_count >= v_target_players then
    update public.matches set status = 'full' where id = target_match_id;
    raise exception 'El partido ya está completo.';
  end if;

  insert into public.match_participants (match_id, user_id, status)
  values (target_match_id, v_user_id, 'joined')
  on conflict (match_id, user_id) where status = 'joined' do nothing;

  if not found then
    raise exception 'Ya estás anotado en este partido.';
  end if;

  if v_joined_count + 1 >= v_target_players then
    update public.matches set status = 'full' where id = target_match_id;
  end if;
end;
$$;

grant execute on function public.join_match(uuid) to authenticated;

-- leave_match -----------------------------------------------------------------------
create or replace function public.leave_match(target_match_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Debés iniciar sesión.';
  end if;

  update public.match_participants
  set status = 'left'
  where match_id = target_match_id and user_id = v_user_id and status = 'joined';

  if not found then
    raise exception 'No estás anotado en este partido.';
  end if;

  update public.matches set status = 'open'
  where id = target_match_id and status = 'full';
end;
$$;

grant execute on function public.leave_match(uuid) to authenticated;

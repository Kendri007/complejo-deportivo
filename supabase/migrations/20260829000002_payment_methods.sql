-- Pago manual: cada complejo carga sus datos de cobro (Pago Móvil, Binance,
-- Zinli, Zelle) desde Configuración -- "efectivo" no necesita instrucciones,
-- ya está implícito como "pagás en el complejo". Al reservar, el cliente
-- elige con qué medio pagó y deja una referencia opcional; no hay cobro
-- automático real (ninguno de estos tiene API pública para eso), es un
-- flujo de comprobante manual que el admin coteja del otro lado.

alter table public.complexes
  add column if not exists payment_pago_movil text,
  add column if not exists payment_binance text,
  add column if not exists payment_zinli text,
  add column if not exists payment_zelle text;

alter table public.reservations
  add column if not exists payment_method text
    check (payment_method in ('pago_movil', 'binance', 'zinli', 'zelle', 'efectivo')),
  add column if not exists payment_reference text;

-- create_reservation: agrega payment_method / payment_reference -------------------
create or replace function public.create_reservation(
  target_court_id uuid,
  target_date date,
  target_start_time time,
  reservation_type text default 'private',
  match_target_players smallint default null,
  payment_method text default null,
  payment_reference text default null
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

  if payment_method is not null and payment_method not in ('pago_movil', 'binance', 'zinli', 'zelle', 'efectivo') then
    raise exception 'Método de pago inválido.';
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

  insert into public.reservations (
    court_id, user_id, date, start_time, end_time, type, price, payment_method, payment_reference
  )
  values (
    target_court_id, v_user_id, target_date, target_start_time, v_end_time, reservation_type, v_price,
    payment_method, payment_reference
  )
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

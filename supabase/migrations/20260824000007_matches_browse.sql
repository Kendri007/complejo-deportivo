-- RPCs para que el cliente navegue partidos abiertos y vea el detalle de
-- uno, con toda la info (cancha/complejo/deporte) resuelta en el server en
-- vez de anidar 4 niveles de embeds de PostgREST desde el cliente.

create or replace function public.list_open_matches(
  filter_sport_key text default null,
  max_results int default 50
)
returns table (
  match_id uuid,
  target_players smallint,
  status text,
  date date,
  start_time time,
  end_time time,
  court_id uuid,
  court_name text,
  complex_id uuid,
  complex_name text,
  sport_key text,
  sport_label text,
  joined_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    m.id as match_id,
    m.target_players,
    m.status,
    r.date,
    r.start_time,
    r.end_time,
    co.id as court_id,
    co.name as court_name,
    cx.id as complex_id,
    cx.name as complex_name,
    sp.key as sport_key,
    sp.label as sport_label,
    (
      select count(*) from public.match_participants mp
      where mp.match_id = m.id and mp.status = 'joined'
    ) as joined_count
  from public.matches m
  join public.reservations r on r.id = m.reservation_id
  join public.courts co on co.id = r.court_id
  join public.complexes cx on cx.id = co.complex_id
  join public.sports sp on sp.id = co.sport_id
  where m.status = 'open'
    and r.date >= current_date
    and cx.is_active
    and public.is_subscription_active(cx.id)
    and (filter_sport_key is null or sp.key = filter_sport_key)
  order by r.date asc, r.start_time asc
  limit max_results;
$$;

grant execute on function public.list_open_matches(text, int) to authenticated;

-- get_match_details -----------------------------------------------------------------
-- Visible si está abierto, o si sos el creador/participante/admin del complejo.
create or replace function public.get_match_details(target_match_id uuid)
returns table (
  match_id uuid,
  target_players smallint,
  status text,
  created_by uuid,
  date date,
  start_time time,
  end_time time,
  court_id uuid,
  court_name text,
  complex_id uuid,
  complex_name text,
  sport_label text,
  joined_count bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.matches m
    where m.id = target_match_id
      and (
        m.status = 'open'
        or m.created_by = auth.uid()
        or public.is_super_admin()
        or exists (
          select 1 from public.match_participants mp
          where mp.match_id = m.id and mp.user_id = auth.uid() and mp.status = 'joined'
        )
        or exists (
          select 1 from public.reservations r
          join public.courts co on co.id = r.court_id
          where r.id = m.reservation_id and public.is_complex_admin(co.complex_id)
        )
      )
  ) then
    raise exception 'Partido no encontrado.';
  end if;

  return query
  select
    m.id,
    m.target_players,
    m.status,
    m.created_by,
    r.date,
    r.start_time,
    r.end_time,
    co.id,
    co.name,
    cx.id,
    cx.name,
    sp.label,
    (
      select count(*) from public.match_participants mp2
      where mp2.match_id = m.id and mp2.status = 'joined'
    )
  from public.matches m
  join public.reservations r on r.id = m.reservation_id
  join public.courts co on co.id = r.court_id
  join public.complexes cx on cx.id = co.complex_id
  join public.sports sp on sp.id = co.sport_id
  where m.id = target_match_id;
end;
$$;

grant execute on function public.get_match_details(uuid) to authenticated;

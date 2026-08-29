-- Disponibilidad semanal para el calendario del cliente: una sola llamada
-- trae los horarios ocupados de los próximos 7 días para una cancha, en vez
-- de pedir día por día. Público (como get_available_slots): no expone quién
-- reservó, solo qué horarios están tomados.
create or replace function public.get_week_availability(
  target_court_id uuid,
  start_date date
)
returns table (date date, start_time time)
language sql
stable
security definer
set search_path = public
as $$
  select r.date, r.start_time
  from public.reservations r
  where r.court_id = target_court_id
    and r.status = 'confirmed'
    and r.date >= start_date
    and r.date < start_date + 7;
$$;

grant execute on function public.get_week_availability(uuid, date) to anon, authenticated;

-- Habilita Realtime sobre reservations para que el calendario se actualice
-- solo cuando alguien reserva/cancela, sin que el cliente tenga que
-- refrescar. Guardado con exists-check para poder re-correr la migración
-- sin que falle si ya estaba agregada.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'reservations'
  ) then
    alter publication supabase_realtime add table public.reservations;
  end if;
end $$;

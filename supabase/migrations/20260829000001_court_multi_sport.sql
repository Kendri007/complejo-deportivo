-- Una cancha puede servir para más de un deporte (ej. una cancha de arena
-- mixta que sirve tanto para beach tenis como beach vóley). courts.sport_id
-- se mantiene como el deporte "principal" (con el que se crea la cancha,
-- define bajo qué tab aparece por defecto en el admin), y court_sports
-- agrega el resto de los deportes que también soporta.

create table public.court_sports (
  id uuid primary key default gen_random_uuid(),
  court_id uuid not null references public.courts (id) on delete cascade,
  sport_id uuid not null references public.sports (id),
  unique (court_id, sport_id)
);

create index court_sports_court_id_idx on public.court_sports (court_id);
create index court_sports_sport_id_idx on public.court_sports (sport_id);

-- Backfill: toda cancha existente al menos "soporta" su sport_id actual.
insert into public.court_sports (court_id, sport_id)
select id, sport_id from public.courts
on conflict do nothing;

-- Mantener sincronizado hacia adelante: al crear una cancha nueva, su
-- deporte principal se agrega automáticamente a court_sports.
create or replace function public.sync_court_primary_sport()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.court_sports (court_id, sport_id)
  values (new.id, new.sport_id)
  on conflict (court_id, sport_id) do nothing;
  return new;
end;
$$;

drop trigger if exists sync_court_primary_sport_trigger on public.courts;
create trigger sync_court_primary_sport_trigger
  after insert on public.courts
  for each row execute function public.sync_court_primary_sport();

-- RLS: mismo criterio que courts (lectura pública si el complejo está
-- activo y con suscripción vigente, o admin/super-admin; escritura solo
-- admin del complejo o super-admin).
alter table public.court_sports enable row level security;

drop policy if exists "court_sports_select" on public.court_sports;
create policy "court_sports_select" on public.court_sports
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

drop policy if exists "court_sports_write_admin" on public.court_sports;
create policy "court_sports_write_admin" on public.court_sports
  for all using (
    exists (
      select 1 from public.courts co
      where co.id = court_id
        and (public.is_super_admin() or public.is_complex_admin(co.complex_id))
    )
  )
  with check (
    exists (
      select 1 from public.courts co
      where co.id = court_id
        and (public.is_super_admin() or public.is_complex_admin(co.complex_id))
    )
  );

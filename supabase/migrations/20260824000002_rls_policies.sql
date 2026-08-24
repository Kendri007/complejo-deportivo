-- Row Level Security: funciones helper + políticas por tabla.

create function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'super_admin'
  );
$$;

create function public.is_complex_admin(target_complex_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.complex_admins
    where complex_id = target_complex_id and user_id = auth.uid()
  );
$$;

-- Vista pública de perfiles (para mostrar participantes de partidos sin
-- exponer teléfono/email). Se deja con las reglas de seguridad del dueño
-- (no security_invoker) a propósito: necesita ver todos los perfiles, no
-- solo el propio, para poder listar participantes de un partido.
create view public.public_profiles
as
  select id, full_name, avatar_url from public.profiles;

grant select on public.public_profiles to authenticated;

alter table public.profiles enable row level security;
alter table public.complexes enable row level security;
alter table public.complex_admins enable row level security;
alter table public.sports enable row level security;
alter table public.courts enable row level security;
alter table public.operating_hours enable row level security;
alter table public.blackout_dates enable row level security;
alter table public.reservations enable row level security;
alter table public.matches enable row level security;
alter table public.match_participants enable row level security;

-- profiles ------------------------------------------------------------------
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_select_super_admin" on public.profiles
  for select using (public.is_super_admin());

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- complexes -------------------------------------------------------------------
create policy "complexes_select" on public.complexes
  for select using (
    is_active or public.is_super_admin() or public.is_complex_admin(id)
  );

create policy "complexes_insert_super_admin" on public.complexes
  for insert with check (public.is_super_admin());

create policy "complexes_update_admin" on public.complexes
  for update using (public.is_super_admin() or public.is_complex_admin(id));

create policy "complexes_delete_super_admin" on public.complexes
  for delete using (public.is_super_admin());

-- complex_admins ----------------------------------------------------------------
create policy "complex_admins_select" on public.complex_admins
  for select using (user_id = auth.uid() or public.is_super_admin());

create policy "complex_admins_insert_super_admin" on public.complex_admins
  for insert with check (public.is_super_admin());

create policy "complex_admins_delete_super_admin" on public.complex_admins
  for delete using (public.is_super_admin());

-- sports --------------------------------------------------------------------------
create policy "sports_select_public" on public.sports
  for select using (true);

create policy "sports_write_super_admin" on public.sports
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- courts ----------------------------------------------------------------------------
create policy "courts_select" on public.courts
  for select using (
    exists (
      select 1 from public.complexes c
      where c.id = complex_id and c.is_active
    )
    or public.is_super_admin()
    or public.is_complex_admin(complex_id)
  );

create policy "courts_write_admin" on public.courts
  for all using (public.is_super_admin() or public.is_complex_admin(complex_id))
  with check (public.is_super_admin() or public.is_complex_admin(complex_id));

-- operating_hours -------------------------------------------------------------------
create policy "operating_hours_select" on public.operating_hours
  for select using (
    exists (
      select 1 from public.courts co
      join public.complexes c on c.id = co.complex_id
      where co.id = court_id
        and (c.is_active or public.is_super_admin() or public.is_complex_admin(c.id))
    )
  );

create policy "operating_hours_write_admin" on public.operating_hours
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

-- blackout_dates ----------------------------------------------------------------------
create policy "blackout_dates_select" on public.blackout_dates
  for select using (
    exists (
      select 1 from public.complexes c
      where c.id = complex_id
        and (c.is_active or public.is_super_admin() or public.is_complex_admin(c.id))
    )
  );

create policy "blackout_dates_write_admin" on public.blackout_dates
  for all using (public.is_super_admin() or public.is_complex_admin(complex_id))
  with check (public.is_super_admin() or public.is_complex_admin(complex_id));

-- reservations ------------------------------------------------------------------------
-- Sin SELECT público: no debe exponerse quién reservó cada slot. Los horarios
-- ocupados se consultan vía la función get_available_slots(). Los inserts y
-- cancelaciones pasan siempre por RPC (create_reservation/cancel_reservation),
-- por eso no hay políticas de insert/update/delete acá.
create policy "reservations_select_own" on public.reservations
  for select using (user_id = auth.uid());

create policy "reservations_select_admin" on public.reservations
  for select using (
    public.is_super_admin()
    or exists (
      select 1 from public.courts co
      where co.id = court_id and public.is_complex_admin(co.complex_id)
    )
  );

-- matches -----------------------------------------------------------------------------
-- Sin insert/update/delete directo: todo pasa por create_reservation/join_match/leave_match.
create policy "matches_select_open" on public.matches
  for select using (status = 'open');

create policy "matches_select_own" on public.matches
  for select using (created_by = auth.uid());

create policy "matches_select_participant" on public.matches
  for select using (
    exists (
      select 1 from public.match_participants mp
      where mp.match_id = id and mp.user_id = auth.uid() and mp.status = 'joined'
    )
  );

create policy "matches_select_admin" on public.matches
  for select using (
    public.is_super_admin()
    or exists (
      select 1 from public.reservations r
      join public.courts co on co.id = r.court_id
      where r.id = reservation_id and public.is_complex_admin(co.complex_id)
    )
  );

-- match_participants --------------------------------------------------------------------
-- Sin insert/update/delete directo: todo pasa por join_match/leave_match.
create policy "match_participants_select" on public.match_participants
  for select using (
    exists (select 1 from public.matches m where m.id = match_id)
  );

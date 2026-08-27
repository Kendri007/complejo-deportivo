-- Fix: la policy "matches_select_participant" consultaba match_participants,
-- y la policy de match_participants a su vez consulta matches -> Postgres
-- detecta esto como recursion infinita (42P17) apenas alguien hace un select
-- directo contra matches. Se rompe el ciclo con una funcion security definer
-- (bypassea RLS internamente, como is_super_admin/is_complex_admin).

create or replace function public.is_match_participant(target_match_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.match_participants mp
    where mp.match_id = target_match_id and mp.user_id = auth.uid() and mp.status = 'joined'
  );
$$;

drop policy if exists "matches_select_participant" on public.matches;
create policy "matches_select_participant" on public.matches
  for select using (public.is_match_participant(id));

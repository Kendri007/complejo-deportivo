-- Helper para que el super-admin pueda asignar admins de complejo buscando
-- por email (auth.users no es accesible desde el cliente).
create or replace function public.find_user_id_by_email(target_email text)
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if not public.is_super_admin() then
    raise exception 'No autorizado.';
  end if;

  select id into v_id from auth.users where email = target_email;
  return v_id;
end;
$$;

grant execute on function public.find_user_id_by_email(text) to authenticated;

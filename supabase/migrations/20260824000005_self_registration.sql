-- Auto-registro de dueños de complejo: se registran solos y quedan activos
-- al instante (sin aprobación manual del super-admin).

-- El trigger que protege profiles.role bloqueaba CUALQUIER cambio de rol
-- hecho por el propio usuario, incluso a través de una función security
-- definer (auth.role() sigue siendo 'authenticated' en ese contexto). Se
-- agrega una bandera de sesión que solo register_complex() puede prender,
-- para permitir ese único caso legítimo de auto-escalado (client -> complex_admin).
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and auth.role() <> 'service_role'
     and coalesce(current_setting('app.bypass_role_guard', true), 'false') <> 'true'
  then
    new.role := old.role;
  end if;
  return new;
end;
$$;

-- register_complex --------------------------------------------------------------
-- Crea el complejo (activo de inmediato), asigna al usuario actual como su
-- admin, y sube su profile de 'client' a 'complex_admin'. Todo en una
-- transacción: si algo falla, no queda un complejo huérfano sin admin.
create or replace function public.register_complex(
  complex_name text,
  complex_address text default null,
  complex_lat double precision default null,
  complex_lng double precision default null,
  complex_phone text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_complex_id uuid;
begin
  if v_user_id is null then
    raise exception 'Debés iniciar sesión para registrar un complejo.';
  end if;

  if complex_name is null or length(trim(complex_name)) = 0 then
    raise exception 'El complejo necesita un nombre.';
  end if;

  insert into public.complexes (name, address, lat, lng, phone, is_active, created_by)
  values (complex_name, complex_address, complex_lat, complex_lng, complex_phone, true, v_user_id)
  returning id into v_complex_id;

  insert into public.complex_admins (complex_id, user_id)
  values (v_complex_id, v_user_id);

  perform set_config('app.bypass_role_guard', 'true', true);
  update public.profiles
  set role = 'complex_admin'
  where id = v_user_id and role = 'client';

  return v_complex_id;
end;
$$;

grant execute on function public.register_complex(text, text, double precision, double precision, text) to authenticated;

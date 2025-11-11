-- Trigger para crear perfil de usuario automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.usuarios (
    id,
    tipo_usuario,
    nombre_completo,
    correo,
    telefono,
    direccion,
    cargo,
    salario_base,
    permisos
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'tipo_usuario', 'Empleado'),
    coalesce(new.raw_user_meta_data ->> 'nombre_completo', ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'telefono', ''),
    coalesce(new.raw_user_meta_data ->> 'direccion', ''),
    coalesce(new.raw_user_meta_data ->> 'cargo', ''),
    coalesce((new.raw_user_meta_data ->> 'salario_base')::numeric, 0),
    coalesce((new.raw_user_meta_data ->> 'permisos')::jsonb, '[]'::jsonb)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

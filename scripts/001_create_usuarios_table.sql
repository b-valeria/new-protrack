-- Tabla de Usuarios (perfiles públicos que referencian auth.users)
create table if not exists public.usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  tipo_usuario text not null check (tipo_usuario in ('Director General', 'Administrador', 'Empleado')),
  nombre_completo text not null,
  correo text not null unique,
  telefono text,
  direccion text,
  cargo text not null,
  salario_base numeric(10, 2),
  permisos jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.usuarios enable row level security;

-- Políticas RLS para usuarios
create policy "usuarios_select_all"
  on public.usuarios for select
  using (true); -- Todos pueden ver usuarios

create policy "usuarios_insert_own"
  on public.usuarios for insert
  with check (auth.uid() = id);

create policy "usuarios_update_own"
  on public.usuarios for update
  using (
    auth.uid() = id OR 
    exists (
      select 1 from public.usuarios 
      where id = auth.uid() 
      and tipo_usuario in ('Director General', 'Administrador')
    )
  );

create policy "usuarios_delete_director"
  on public.usuarios for delete
  using (
    exists (
      select 1 from public.usuarios 
      where id = auth.uid() 
      and tipo_usuario = 'Director General'
    )
  );

-- Trigger para actualizar updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_usuarios_updated_at
  before update on public.usuarios
  for each row
  execute function update_updated_at_column();

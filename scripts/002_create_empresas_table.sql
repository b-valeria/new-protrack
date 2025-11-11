-- Tabla de Empresas
create table if not exists public.empresas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  director_general_id uuid references public.usuarios(id) on delete set null,
  empleados jsonb default '[]'::jsonb,
  categoria_a jsonb default '[]'::jsonb,
  categoria_b jsonb default '[]'::jsonb,
  categoria_c jsonb default '[]'::jsonb,
  almacenes jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.empresas enable row level security;

-- Políticas RLS para empresas
create policy "empresas_select_empleados"
  on public.empresas for select
  using (
    exists (
      select 1 from public.usuarios 
      where id = auth.uid()
    )
  );

create policy "empresas_insert_director"
  on public.empresas for insert
  with check (
    exists (
      select 1 from public.usuarios 
      where id = auth.uid() 
      and tipo_usuario = 'Director General'
    )
  );

create policy "empresas_update_director"
  on public.empresas for update
  using (
    director_general_id = auth.uid() OR
    exists (
      select 1 from public.usuarios 
      where id = auth.uid() 
      and tipo_usuario = 'Director General'
    )
  );

create trigger update_empresas_updated_at
  before update on public.empresas
  for each row
  execute function update_updated_at_column();

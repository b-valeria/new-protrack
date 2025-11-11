-- Tabla de Donaciones
create table if not exists public.donaciones (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid references public.productos(id) on delete cascade,
  nombre_producto text not null,
  cantidad_donada integer not null,
  sede_salida text not null,
  organizacion_receptora text not null,
  fecha timestamptz not null default now(),
  estado text not null default 'Pendiente' check (estado in ('Pendiente', 'Aprobada', 'Rechazada', 'Completada')),
  solicitado_por uuid references public.usuarios(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.donaciones enable row level security;

-- Políticas RLS para donaciones
create policy "donaciones_select_admin"
  on public.donaciones for select
  using (
    exists (
      select 1 from public.usuarios 
      where id = auth.uid() 
      and tipo_usuario in ('Director General', 'Administrador')
    )
  );

create policy "donaciones_insert_admin"
  on public.donaciones for insert
  with check (
    exists (
      select 1 from public.usuarios 
      where id = auth.uid() 
      and tipo_usuario in ('Director General', 'Administrador')
    )
  );

create policy "donaciones_update_director"
  on public.donaciones for update
  using (
    exists (
      select 1 from public.usuarios 
      where id = auth.uid() 
      and tipo_usuario = 'Director General'
    )
  );

create trigger update_donaciones_updated_at
  before update on public.donaciones
  for each row
  execute function update_updated_at_column();

-- Índices
create index idx_donaciones_producto on public.donaciones(producto_id);
create index idx_donaciones_fecha on public.donaciones(fecha);
create index idx_donaciones_estado on public.donaciones(estado);

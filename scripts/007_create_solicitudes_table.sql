-- Tabla de Solicitudes (Reabastecimiento)
create table if not exists public.solicitudes (
  id uuid primary key default gen_random_uuid(),
  tipo_solicitud text not null check (tipo_solicitud in ('Reabastecimiento', 'Traslado')),
  producto_id uuid references public.productos(id) on delete cascade,
  nombre_producto text not null,
  cantidad_solicitada integer not null,
  motivo text,
  estado text not null default 'Pendiente' check (estado in ('Pendiente', 'Aprobada', 'Rechazada', 'Delegada')),
  solicitado_por uuid references public.usuarios(id),
  revisado_por uuid references public.usuarios(id),
  fecha_solicitud timestamptz not null default now(),
  fecha_revision timestamptz,
  notas_revision text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.solicitudes enable row level security;

-- Políticas RLS para solicitudes
create policy "solicitudes_select_all"
  on public.solicitudes for select
  using (
    exists (
      select 1 from public.usuarios 
      where id = auth.uid()
    )
  );

create policy "solicitudes_insert_authenticated"
  on public.solicitudes for insert
  with check (
    exists (
      select 1 from public.usuarios 
      where id = auth.uid()
    )
  );

create policy "solicitudes_update_admin"
  on public.solicitudes for update
  using (
    exists (
      select 1 from public.usuarios 
      where id = auth.uid() 
      and tipo_usuario in ('Director General', 'Administrador')
    )
  );

create trigger update_solicitudes_updated_at
  before update on public.solicitudes
  for each row
  execute function update_updated_at_column();

-- Índices
create index idx_solicitudes_producto on public.solicitudes(producto_id);
create index idx_solicitudes_estado on public.solicitudes(estado);
create index idx_solicitudes_solicitado_por on public.solicitudes(solicitado_por);

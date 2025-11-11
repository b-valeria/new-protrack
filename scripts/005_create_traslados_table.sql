-- Tabla de Traslados
create table if not exists public.traslados (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid references public.productos(id) on delete cascade,
  nombre_producto text not null,
  sede_origen text not null,
  sede_destino text not null,
  cantidad integer not null,
  fecha timestamptz not null default now(),
  motivo text,
  encargado_id uuid references public.usuarios(id),
  estado text not null default 'Pendiente' check (estado in ('Pendiente', 'Aprobado', 'Rechazado', 'Completado')),
  created_by uuid references public.usuarios(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.traslados enable row level security;

-- Políticas RLS para traslados
create policy "traslados_select_all"
  on public.traslados for select
  using (
    exists (
      select 1 from public.usuarios 
      where id = auth.uid()
    )
  );

create policy "traslados_insert_authenticated"
  on public.traslados for insert
  with check (
    exists (
      select 1 from public.usuarios 
      where id = auth.uid()
    )
  );

create policy "traslados_update_authenticated"
  on public.traslados for update
  using (
    exists (
      select 1 from public.usuarios 
      where id = auth.uid()
    )
  );

create trigger update_traslados_updated_at
  before update on public.traslados
  for each row
  execute function update_updated_at_column();

-- Índices
create index idx_traslados_producto on public.traslados(producto_id);
create index idx_traslados_fecha on public.traslados(fecha);
create index idx_traslados_estado on public.traslados(estado);

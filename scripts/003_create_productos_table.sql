-- Tabla de Productos
create table if not exists public.productos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  tipo text not null,
  categoria text not null check (categoria in ('A', 'B', 'C')),
  proveedor text not null,
  ubicacion text not null,
  nro_lotes integer not null default 0,
  tamanio_lote integer not null default 0,
  fecha_entrada timestamptz not null default now(),
  fecha_expiracion timestamptz,
  cantidad_disponible integer not null default 0,
  umbral_minimo integer not null default 0,
  umbral_maximo integer not null default 0,
  entrada text not null check (entrada in ('Inventario Inicial', 'Reabastecimiento')),
  costo_unitario numeric(10, 2) not null,
  imagen text,
  observaciones text,
  created_by uuid references public.usuarios(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.productos enable row level security;

-- Políticas RLS para productos
create policy "productos_select_all"
  on public.productos for select
  using (
    exists (
      select 1 from public.usuarios 
      where id = auth.uid()
    )
  );

create policy "productos_insert_authenticated"
  on public.productos for insert
  with check (
    exists (
      select 1 from public.usuarios 
      where id = auth.uid()
    )
  );

create policy "productos_update_authenticated"
  on public.productos for update
  using (
    exists (
      select 1 from public.usuarios 
      where id = auth.uid()
    )
  );

create policy "productos_delete_director"
  on public.productos for delete
  using (
    exists (
      select 1 from public.usuarios 
      where id = auth.uid() 
      and tipo_usuario = 'Director General'
    )
  );

create trigger update_productos_updated_at
  before update on public.productos
  for each row
  execute function update_updated_at_column();

-- Índices para mejorar el rendimiento
create index idx_productos_categoria on public.productos(categoria);
create index idx_productos_nombre on public.productos(nombre);
create index idx_productos_proveedor on public.productos(proveedor);
create index idx_productos_ubicacion on public.productos(ubicacion);

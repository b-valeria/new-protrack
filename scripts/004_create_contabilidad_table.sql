-- Tabla de Contabilidad (Movimientos de ventas)
create table if not exists public.contabilidad (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid references public.productos(id) on delete cascade,
  nombre_producto text not null,
  tipo_movimiento text not null check (tipo_movimiento in ('B2B', 'Online', 'Consultiva', 'Venta Directa')),
  fecha timestamptz not null default now(),
  precio_venta numeric(10, 2) not null,
  unidades_vendidas integer not null,
  created_by uuid references public.usuarios(id),
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.contabilidad enable row level security;

-- Políticas RLS para contabilidad
create policy "contabilidad_select_admin"
  on public.contabilidad for select
  using (
    exists (
      select 1 from public.usuarios 
      where id = auth.uid() 
      and tipo_usuario in ('Director General', 'Administrador')
    )
  );

create policy "contabilidad_insert_authenticated"
  on public.contabilidad for insert
  with check (
    exists (
      select 1 from public.usuarios 
      where id = auth.uid()
    )
  );

create policy "contabilidad_update_admin"
  on public.contabilidad for update
  using (
    exists (
      select 1 from public.usuarios 
      where id = auth.uid() 
      and tipo_usuario in ('Director General', 'Administrador')
    )
  );

-- Índices
create index idx_contabilidad_producto on public.contabilidad(producto_id);
create index idx_contabilidad_fecha on public.contabilidad(fecha);
create index idx_contabilidad_tipo on public.contabilidad(tipo_movimiento);

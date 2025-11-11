-- Tabla de Informes de Recepción
create table if not exists public.informes_recepcion (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid references public.productos(id) on delete cascade,
  nombre_producto text not null,
  categoria text not null,
  proveedor text not null,
  ubicacion text not null,
  nro_lotes integer not null,
  tamanio_lote integer not null,
  fecha_expiracion timestamptz,
  observaciones text,
  creado_por uuid references public.usuarios(id),
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.informes_recepcion enable row level security;

-- Políticas RLS para informes de recepción
create policy "informes_recepcion_select_admin"
  on public.informes_recepcion for select
  using (
    exists (
      select 1 from public.usuarios 
      where id = auth.uid() 
      and tipo_usuario in ('Director General', 'Administrador')
    )
  );

create policy "informes_recepcion_insert_authenticated"
  on public.informes_recepcion for insert
  with check (
    exists (
      select 1 from public.usuarios 
      where id = auth.uid()
    )
  );

-- Índices
create index idx_informes_recepcion_producto on public.informes_recepcion(producto_id);
create index idx_informes_recepcion_fecha on public.informes_recepcion(created_at);

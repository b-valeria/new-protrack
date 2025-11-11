-- Tabla de Alertas del Sistema
create table if not exists public.alertas (
  id uuid primary key default gen_random_uuid(),
  tipo_alerta text not null check (tipo_alerta in ('Stock Bajo', 'Exceso de Stock', 'Producto Próximo a Vencer', 'Reporte Mensual')),
  producto_id uuid references public.productos(id) on delete cascade,
  mensaje text not null,
  leida boolean default false,
  destinatario_id uuid references public.usuarios(id),
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.alertas enable row level security;

-- Políticas RLS para alertas
create policy "alertas_select_own"
  on public.alertas for select
  using (destinatario_id = auth.uid());

create policy "alertas_insert_system"
  on public.alertas for insert
  with check (true); -- El sistema puede crear alertas

create policy "alertas_update_own"
  on public.alertas for update
  using (destinatario_id = auth.uid());

-- Índices
create index idx_alertas_destinatario on public.alertas(destinatario_id);
create index idx_alertas_leida on public.alertas(leida);
create index idx_alertas_tipo on public.alertas(tipo_alerta);

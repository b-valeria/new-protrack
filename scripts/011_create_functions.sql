-- Función para calcular unidades adquiridas
create or replace function calcular_unidades_adquiridas(p_nro_lotes integer, p_tamanio_lote integer)
returns integer
language plpgsql
as $$
begin
  return p_nro_lotes * p_tamanio_lote;
end;
$$;

-- Función para calcular total de compra
create or replace function calcular_total_compra(p_unidades integer, p_costo_unitario numeric)
returns numeric
language plpgsql
as $$
begin
  return p_unidades * p_costo_unitario;
end;
$$;

-- Función para calcular ganancia
create or replace function calcular_ganancia(p_precio_venta numeric, p_unidades_vendidas integer)
returns numeric
language plpgsql
as $$
begin
  return p_precio_venta * p_unidades_vendidas;
end;
$$;

-- Función para obtener ganancias totales de un producto
create or replace function obtener_ganancias_totales(p_producto_id uuid)
returns numeric
language plpgsql
as $$
declare
  v_total numeric;
begin
  select coalesce(sum(precio_venta * unidades_vendidas), 0)
  into v_total
  from public.contabilidad
  where producto_id = p_producto_id;
  
  return v_total;
end;
$$;

-- Función para verificar stock bajo
create or replace function verificar_stock_bajo()
returns trigger
language plpgsql
as $$
begin
  if new.cantidad_disponible <= new.umbral_minimo then
    insert into public.alertas (tipo_alerta, producto_id, mensaje, destinatario_id)
    select 
      'Stock Bajo',
      new.id,
      'El producto ' || new.nombre || ' ha alcanzado el umbral mínimo de stock.',
      u.id
    from public.usuarios u
    where u.tipo_usuario in ('Director General', 'Administrador');
  end if;
  
  return new;
end;
$$;

create trigger trigger_verificar_stock_bajo
  after update of cantidad_disponible on public.productos
  for each row
  execute function verificar_stock_bajo();

-- Función para verificar exceso de stock
create or replace function verificar_exceso_stock()
returns trigger
language plpgsql
as $$
begin
  if new.cantidad_disponible >= new.umbral_maximo then
    insert into public.alertas (tipo_alerta, producto_id, mensaje, destinatario_id)
    select 
      'Exceso de Stock',
      new.id,
      'El producto ' || new.nombre || ' ha alcanzado el umbral máximo de stock.',
      u.id
    from public.usuarios u
    where u.tipo_usuario in ('Director General', 'Administrador');
  end if;
  
  return new;
end;
$$;

create trigger trigger_verificar_exceso_stock
  after update of cantidad_disponible on public.productos
  for each row
  execute function verificar_exceso_stock();

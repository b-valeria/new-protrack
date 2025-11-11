"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateProducto(id: string, data: any) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("productos")
    .update({
      nombre: data.nombre,
      tipo: data.tipo,
      categoria: data.categoria,
      nro_lotes: data.nro_lotes,
      tamanio_lote: data.tamanio_lote,
      costo_unitario: data.costo_unitario,
      cantidad_disponible: data.cantidad_disponible,
      stock_minimo: data.stock_minimo,
      stock_maximo: data.stock_maximo,
      ubicacion: data.ubicacion,
      proveedor: data.proveedor,
      fecha_expiracion: data.fecha_expiracion || null,
      descripcion: data.descripcion || null,
      unidades_adquiridas: data.nro_lotes * data.tamanio_lote,
    })
    .eq("id_producto", id)

  if (error) throw error

  revalidatePath("/dashboard")
  return { success: true }
}

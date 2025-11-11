import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    console.log("[v0] Iniciando POST /api/movimientos")

    const supabase = await createClient()

    // Verificar autenticación
    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log("[v0] Usuario autenticado:", user?.id)

    if (!user) {
      console.error("[v0] Usuario no autenticado")
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    console.log("[v0] Body recibido:", body)

    const { tipo_movimiento, producto_id, cantidad, sede_origen, sede_destino, motivo, precio_venta, registrado_por } =
      body

    // Validaciones
    if (!tipo_movimiento || !producto_id || !cantidad || !registrado_por) {
      console.error("[v0] Faltan campos obligatorios", { tipo_movimiento, producto_id, cantidad, registrado_por })
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
    }

    // Validar que el producto existe y tiene suficiente stock
    console.log("[v0] Verificando producto:", producto_id)

    const { data: producto, error: productoError } = await supabase
      .from("productos")
      .select("cantidad_disponible, nombre")
      .eq("id", producto_id)
      .single()

    if (productoError || !producto) {
      console.error("[v0] Error al obtener producto:", productoError)
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    console.log("[v0] Producto encontrado:", producto)

    if (producto.cantidad_disponible < cantidad) {
      console.error("[v0] Stock insuficiente")
      return NextResponse.json(
        { error: `Stock insuficiente. Disponible: ${producto.cantidad_disponible}` },
        { status: 400 },
      )
    }

    // Validaciones según tipo de movimiento
    if (tipo_movimiento === "Traslado" && (!sede_origen || !sede_destino)) {
      console.error("[v0] Faltan sedes para traslado")
      return NextResponse.json({ error: "Sede origen y destino son obligatorias para traslados" }, { status: 400 })
    }

    // Insertar movimiento
    console.log("[v0] Insertando movimiento en la base de datos")

    const { data: movimiento, error: movimientoError } = await supabase
      .from("movimientos")
      .insert({
        tipo_movimiento,
        producto_id,
        cantidad,
        sede_origen,
        sede_destino,
        motivo,
        precio_venta,
        registrado_por,
        fecha_movimiento: new Date().toISOString(),
      })
      .select()
      .single()

    if (movimientoError) {
      console.error("[v0] Error al insertar movimiento:", movimientoError)
      return NextResponse.json({ error: "Error al registrar movimiento: " + movimientoError.message }, { status: 500 })
    }

    console.log("[v0] Movimiento insertado exitosamente:", movimiento)

    // Actualizar stock del producto (solo para Pérdida, reducir stock)
    if (tipo_movimiento === "Pérdida") {
      console.log("[v0] Actualizando stock por pérdida")

      const { error: updateError } = await supabase
        .from("productos")
        .update({
          cantidad_disponible: producto.cantidad_disponible - cantidad,
          updated_at: new Date().toISOString(),
        })
        .eq("id", producto_id)

      if (updateError) {
        console.error("[v0] Error al actualizar stock:", updateError)
        // No falla la operación, solo logea el error
      } else {
        console.log("[v0] Stock actualizado correctamente")
      }
    }

    console.log("[v0] Proceso completado exitosamente")
    return NextResponse.json(movimiento, { status: 201 })
  } catch (error) {
    console.error("[v0] Error en POST /api/movimientos:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function PUT(request: Request) {
  try {
    console.log("[v0] Iniciando PUT /api/perfil")

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

    const { nombre_completo, correo_electronico, telefono, direccion, cargo, salario_base, foto_perfil } = body

    // Buscar el usuario en la base de datos usando el ID de autenticación
    const { data: usuarioActual, error: usuarioError } = await supabase
      .from("usuarios")
      .select("id, tipo_usuario")
      .eq("id", user.id)
      .single()

    if (usuarioError || !usuarioActual) {
      console.error("[v0] Error al obtener usuario:", usuarioError)
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    console.log("[v0] Usuario actual:", usuarioActual)

    // Preparar datos para actualizar
    const datosActualizados: any = {
      nombre_completo,
      correo: correo_electronico, // El frontend envía correo_electronico pero la BD usa correo
      telefono,
      direccion,
      foto_perfil,
      updated_at: new Date().toISOString(),
    }

    // Solo el Director General puede actualizar cargo y salario
    if (usuarioActual.tipo_usuario === "Director General") {
      datosActualizados.cargo = cargo
      datosActualizados.salario_base = salario_base
      console.log("[v0] Director General puede actualizar cargo y salario")
    } else {
      console.log("[v0] Usuario no puede actualizar cargo ni salario")
    }

    // Actualizar usuario
    console.log("[v0] Actualizando usuario con datos:", datosActualizados)

    const { data: usuarioActualizado, error: updateError } = await supabase
      .from("usuarios")
      .update(datosActualizados)
      .eq("id", user.id)
      .select()
      .single()

    if (updateError) {
      console.error("[v0] Error al actualizar usuario:", updateError)
      return NextResponse.json({ error: "Error al actualizar perfil: " + updateError.message }, { status: 500 })
    }

    console.log("[v0] Usuario actualizado exitosamente:", usuarioActualizado)
    return NextResponse.json(usuarioActualizado, { status: 200 })
  } catch (error) {
    console.error("[v0] Error en PUT /api/perfil:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

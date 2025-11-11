"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateUsuarioPermisos(usuarioId: string, permisos: string[]) {
  const supabase = await createServerClient()

  const { error } = await supabase
    .from("usuarios")
    .update({ permisos, updated_at: new Date().toISOString() })
    .eq("id", usuarioId)

  if (error) {
    throw new Error("Error al actualizar permisos: " + error.message)
  }

  revalidatePath("/dashboard/administrador/staff")
  revalidatePath("/dashboard/director/staff")
}

export async function updateUsuario(
  usuarioId: string,
  data: {
    nombre_completo: string
    telefono: string
    direccion: string
    cargo: string
    salario_base: number
  },
) {
  const supabase = await createServerClient()

  const { error } = await supabase
    .from("usuarios")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", usuarioId)

  if (error) {
    throw new Error("Error al actualizar usuario: " + error.message)
  }

  revalidatePath("/dashboard/administrador/staff")
  revalidatePath("/dashboard/director/staff")
}

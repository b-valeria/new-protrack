import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Obtener información del usuario
  const { data: usuario } = await supabase.from("usuarios").select("*").eq("id", user.id).single()

  if (!usuario) {
    redirect("/auth/login")
  }

  // Redirigir según el tipo de usuario
  switch (usuario.tipo_usuario) {
    case "Empleado":
      redirect("/dashboard/empleado")
    case "Administrador":
      redirect("/dashboard/administrador")
    case "Director General":
      redirect("/dashboard/director")
    default:
      redirect("/auth/login")
  }
}

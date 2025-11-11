import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { MovimientosContent } from "@/components/movimientos-content"
import { Package, FileText, TrendingUp } from "lucide-react"

export default async function EmpleadoMovimientosPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: usuario } = await supabase.from("usuarios").select("*").eq("id", user.id).single()

  if (!usuario || usuario.tipo_usuario !== "Empleado") {
    redirect("/dashboard")
  }

  const { data: productos } = await supabase
    .from("productos")
    .select("id, nombre, cantidad_disponible, ubicacion")
    .order("nombre")

  const navigation = [
    {
      name: "Inicio",
      href: "/dashboard/empleado",
      icon: <Package className="h-5 w-5" style={{ color: "#487FBB" }} />,
    },
    {
      name: "Catálogo",
      href: "/dashboard/empleado/catalogo",
      icon: <Package className="h-5 w-5" style={{ color: "#487FBB" }} />,
    },
    {
      name: "Solicitudes",
      href: "/dashboard/empleado/solicitudes",
      icon: <FileText className="h-5 w-5" style={{ color: "#487FBB" }} />,
    },
    {
      name: "Movimientos",
      href: "/dashboard/empleado/movimientos",
      icon: <TrendingUp className="h-5 w-5" style={{ color: "#487FBB" }} />,
    },
  ]

  return (
    <DashboardLayout usuario={usuario} navigation={navigation}>
      <MovimientosContent usuario={usuario} productos={productos || []} />
    </DashboardLayout>
  )
}

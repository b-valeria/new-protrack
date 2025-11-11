import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DirectorSolicitudesContent } from "@/components/director-solicitudes-content"
import { Package, FileText, Users, TrendingUp, BarChart3, Settings } from "lucide-react"

export default async function DirectorSolicitudesPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: usuario } = await supabase.from("usuarios").select("*").eq("id", user.id).single()

  if (!usuario || usuario.tipo_usuario !== "Director General") {
    redirect("/dashboard")
  }

  const navigation = [
    {
      name: "Inicio",
      href: "/dashboard/director",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      name: "Catálogo",
      href: "/dashboard/director/catalogo",
      icon: <Package className="h-5 w-5" />,
    },
    {
      name: "Solicitudes",
      href: "/dashboard/director/solicitudes",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: "Staff",
      href: "/dashboard/director/staff",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Informes",
      href: "/dashboard/director/informes",
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      name: "Configuración",
      href: "/dashboard/director/configuracion",
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  const { data: solicitudesIniciales } = await supabase
    .from("solicitudes")
    .select("*")
    .in("estado", ["Pendiente", "Delegada"])
    .order("created_at", { ascending: false })

  return (
    <DashboardLayout usuario={usuario} navigation={navigation}>
      <DirectorSolicitudesContent initialSolicitudes={solicitudesIniciales || []} usuario={usuario} />
    </DashboardLayout>
  )
}

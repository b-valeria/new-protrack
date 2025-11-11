import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PerfilPageClient } from "@/components/perfil-page-client"
import { Package, FileText, Users, TrendingUp, BarChart3, Settings } from "lucide-react"

export default async function PerfilPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: usuario } = await supabase.from("usuarios").select("*").eq("id", user.id).single()

  if (!usuario) {
    redirect("/auth/login")
  }

  let navigation = []
  switch (usuario.tipo_usuario) {
    case "Director General":
      navigation = [
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
      break
    case "Administrador":
      navigation = [
        {
          name: "Inicio",
          href: "/dashboard/administrador",
          icon: <BarChart3 className="h-5 w-5" style={{ color: "#487FBB" }} />,
        },
        {
          name: "Catálogo",
          href: "/dashboard/administrador/catalogo",
          icon: <Package className="h-5 w-5" style={{ color: "#487FBB" }} />,
        },
        {
          name: "Solicitudes",
          href: "/dashboard/administrador/solicitudes",
          icon: <FileText className="h-5 w-5" style={{ color: "#487FBB" }} />,
        },
        {
          name: "Staff",
          href: "/dashboard/administrador/staff",
          icon: <Users className="h-5 w-5" style={{ color: "#487FBB" }} />,
        },
        {
          name: "Informes",
          href: "/dashboard/administrador/informes",
          icon: <TrendingUp className="h-5 w-5" style={{ color: "#487FBB" }} />,
        },
      ]
      break
    case "Empleado":
      navigation = [
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
      break
  }

  return (
    <DashboardLayout usuario={usuario} navigation={navigation}>
      <PerfilPageClient usuario={usuario} />
    </DashboardLayout>
  )
}

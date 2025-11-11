import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StaffManagementDirector } from "@/components/staff-management-director"
import { Package, FileText, Users, TrendingUp, BarChart3, Settings } from "lucide-react"

export default async function DirectorStaffPage() {
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
      icon: <BarChart3 className="h-5 w-5" style={{ color: "#487FBB" }} />,
    },
    {
      name: "Catálogo",
      href: "/dashboard/director/catalogo",
      icon: <Package className="h-5 w-5" style={{ color: "#487FBB" }} />,
    },
    {
      name: "Solicitudes",
      href: "/dashboard/director/solicitudes",
      icon: <FileText className="h-5 w-5" style={{ color: "#487FBB" }} />,
    },
    {
      name: "Staff",
      href: "/dashboard/director/staff",
      icon: <Users className="h-5 w-5" style={{ color: "#487FBB" }} />,
    },
    {
      name: "Informes",
      href: "/dashboard/director/informes",
      icon: <TrendingUp className="h-5 w-5" style={{ color: "#487FBB" }} />,
    },
    {
      name: "Configuración",
      href: "/dashboard/director/configuracion",
      icon: <Settings className="h-5 w-5" style={{ color: "#487FBB" }} />,
    },
  ]

  return (
    <DashboardLayout usuario={usuario} navigation={navigation}>
      <StaffManagementDirector />
    </DashboardLayout>
  )
}

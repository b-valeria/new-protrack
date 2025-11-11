import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { AdministradorSolicitudesContent } from "@/components/administrador-solicitudes-content"
import { Package, FileText, Users, TrendingUp } from "lucide-react"

export default async function AdministradorSolicitudesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: usuario } = await supabase.from("usuarios").select("*").eq("id", user.id).single()

  if (!usuario || usuario.tipo_usuario !== "Administrador") {
    redirect("/dashboard")
  }

  const { data: solicitudes } = await supabase.from("solicitudes").select("*").order("created_at", { ascending: false })

  const { data: productos } = await supabase.from("productos").select("*").order("nombre")

  const navigation = [
    {
      name: "Inicio",
      href: "/dashboard/administrador",
      icon: <TrendingUp className="h-5 w-5" style={{ color: "#487FBB" }} />,
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

  return (
    <DashboardLayout usuario={usuario} navigation={navigation}>
      <AdministradorSolicitudesContent
        usuario={usuario}
        solicitudesIniciales={solicitudes || []}
        productos={productos || []}
      />
    </DashboardLayout>
  )
}

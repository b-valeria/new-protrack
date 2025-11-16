import { createServerClient } from "@/lib/supabase/server"
import { redirect } from 'next/navigation'
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ListaDonacionesDirector } from "@/components/lista-donaciones-director"

export default async function DonacionesDirectorPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!usuario || usuario.tipo_usuario !== "Director General") {
    redirect("/dashboard")
  }

  const menuItems = [
    { name: "Inicio", href: "/dashboard/director", icon: "LayoutDashboard" },
    { name: "Catálogo", href: "/dashboard/director/catalogo", icon: "Package" },
    { name: "Configuración", href: "/dashboard/director/configuracion", icon: "Settings" },
    { name: "Informes", href: "/dashboard/director/informes", icon: "FileText" },
    { name: "Solicitudes", href: "/dashboard/director/solicitudes", icon: "ClipboardList" },
    { name: "Donaciones", href: "/dashboard/director/donaciones", icon: "Heart", current: true },
    { name: "Staff", href: "/dashboard/director/staff", icon: "Users" },
  ]

  return (
    <DashboardLayout usuario={usuario} menuItems={menuItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Donaciones</h1>
          <p className="text-muted-foreground">Revisa y aprueba las solicitudes de donación</p>
        </div>

        <ListaDonacionesDirector usuario={usuario} />
      </div>
    </DashboardLayout>
  )
}

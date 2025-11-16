import { createServerClient } from "@/lib/supabase/server"
import { redirect } from 'next/navigation'
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { FormularioDonaciones } from "@/components/formulario-donaciones"

export default async function DonacionesAdministradorPage() {
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

  if (!usuario || usuario.tipo_usuario !== "Administrador") {
    redirect("/dashboard")
  }

  const menuItems = [
    { name: "Inicio", href: "/dashboard/administrador", icon: "LayoutDashboard" },
    { name: "Catálogo", href: "/dashboard/administrador/catalogo", icon: "Package" },
    { name: "Informes", href: "/dashboard/administrador/informes", icon: "FileText" },
    { name: "Solicitudes", href: "/dashboard/administrador/solicitudes", icon: "ClipboardList" },
    { name: "Donaciones", href: "/dashboard/administrador/donaciones", icon: "Heart", current: true },
    { name: "Staff", href: "/dashboard/administrador/staff", icon: "Users" },
    { name: "Configuración", href: "/dashboard/configuracion", icon: "Settings" },
  ]

  return (
    <DashboardLayout usuario={usuario} menuItems={menuItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Donaciones</h1>
          <p className="text-muted-foreground">Solicita donaciones de productos</p>
        </div>

        <FormularioDonaciones usuario={usuario} />
      </div>
    </DashboardLayout>
  )
}

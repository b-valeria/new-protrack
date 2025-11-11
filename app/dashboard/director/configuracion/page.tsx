import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, FileText, Users, TrendingUp, BarChart3, Settings } from "lucide-react"

export default async function DirectorConfiguracionPage() {
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "#0D2646" }}>
            Configuración del Sistema
          </h1>
          <p className="text-muted-foreground">Gestiona alertas, almacenes y configuraciones avanzadas</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configuración Avanzada</CardTitle>
            <CardDescription>Próximamente disponible</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Esta sección permitirá configurar alertas automáticas, gestionar almacenes y ajustar parámetros del
              sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

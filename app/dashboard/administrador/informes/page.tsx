import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BarChart3, Package, FileText, Users, TrendingUp } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { TablaTraslados } from "@/components/reportes/tabla-traslados"
import { TablaContabilidad } from "@/components/reportes/tabla-contabilidad"
import { TabsList, TabsTrigger, TabsContent, Tabs } from "@/components/ui/tabs"

export default async function AdministradorInformesPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: usuario } = await supabase.from("usuarios").select("*").eq("id", user.id).single()

  if (!usuario || usuario.tipo_usuario !== "Administrador") {
    redirect("/dashboard")
  }

  const { data: traslados } = await supabase.from("traslados").select("*").order("fecha", { ascending: false })

  const { data: contabilidad } = await supabase.from("contabilidad").select("*").order("fecha", { ascending: false })

  const { data: movimientos } = await supabase
    .from("movimientos")
    .select("*, productos(nombre)")
    .order("fecha_movimiento", { ascending: false })

  const navigation = [
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

  return (
    <DashboardLayout usuario={usuario} navigation={navigation}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "#0D2646" }}>
            Informes y Reportes
          </h1>
          <p className="text-muted-foreground">Consulta y descarga informes de traslados y contabilidad</p>
        </div>

        <Tabs defaultValue="traslados" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="traslados">Traslados</TabsTrigger>
            <TabsTrigger value="contabilidad">Contabilidad</TabsTrigger>
          </TabsList>

          <TabsContent value="traslados" className="space-y-4">
            <TablaTraslados datos={traslados || []} movimientos={movimientos || []} />
          </TabsContent>

          <TabsContent value="contabilidad" className="space-y-4">
            <TablaContabilidad datos={contabilidad || []} movimientos={movimientos || []} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

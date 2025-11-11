import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TablaRecepcion } from "@/components/reportes/tabla-recepcion"
import { TablaTraslados } from "@/components/reportes/tabla-traslados"
import { TablaContabilidad } from "@/components/reportes/tabla-contabilidad"
import { TablaInventario } from "@/components/reportes/tabla-inventario"
import { Package, FileText, Users, TrendingUp, BarChart3, Settings } from "lucide-react"

export default async function DirectorInformesPage() {
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

  const { data: informesRecepcion } = await supabase
    .from("informes_recepcion")
    .select("*")
    .order("created_at", { ascending: false })

  const { data: traslados } = await supabase.from("traslados").select("*").order("fecha", { ascending: false })

  const { data: contabilidad } = await supabase.from("contabilidad").select("*").order("fecha", { ascending: false })

  const { data: movimientos } = await supabase
    .from("movimientos")
    .select("*")
    .order("fecha_movimiento", { ascending: false })

  const { data: productos } = await supabase
    .from("productos")
    .select("id_producto, nombre, categoria, nro_lotes, tamanio_lote, unidades_adquiridas, fecha_entrada")
    .order("categoria", { ascending: true })

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
            Informes y Análisis
          </h1>
          <p className="text-muted-foreground">Reportes completos con exportación a Excel y análisis detallado</p>
        </div>

        <Tabs defaultValue="recepcion" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="recepcion">Recepción</TabsTrigger>
            <TabsTrigger value="traslados">Traslados</TabsTrigger>
            <TabsTrigger value="contabilidad">Contabilidad</TabsTrigger>
            <TabsTrigger value="inventario">Inventario</TabsTrigger>
          </TabsList>

          <TabsContent value="recepcion" className="space-y-4">
            <TablaRecepcion datos={informesRecepcion || []} />
          </TabsContent>

          <TabsContent value="traslados" className="space-y-4">
            <TablaTraslados datos={traslados || []} movimientos={movimientos || []} />
          </TabsContent>

          <TabsContent value="contabilidad" className="space-y-4">
            <TablaContabilidad datos={contabilidad || []} movimientos={movimientos || []} />
          </TabsContent>

          <TabsContent value="inventario" className="space-y-4">
            <TablaInventario datos={productos || []} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

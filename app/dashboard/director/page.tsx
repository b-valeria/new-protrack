import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, FileText, Users, TrendingUp, AlertCircle, BarChart3, Settings, DollarSign } from "lucide-react"

export default async function DirectorDashboardPage() {
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

  // Obtener estadísticas completas
  const { count: totalProductos } = await supabase.from("productos").select("*", { count: "exact", head: true })

  const { count: solicitudesPendientes } = await supabase
    .from("solicitudes")
    .select("*", { count: "exact", head: true })
    .eq("estado", "Pendiente")

  const { count: totalUsuarios } = await supabase.from("usuarios").select("*", { count: "exact", head: true })

  const { data: productos } = await supabase.from("productos").select("*")

  // Calcular valor total del inventario
  const valorTotal =
    productos?.reduce((sum, p) => {
      return sum + p.nro_lotes * p.tamanio_lote * p.costo_unitario
    }, 0) || 0

  // Productos por categoría
  const categoriaA = productos?.filter((p) => p.categoria === "A").length || 0
  const categoriaB = productos?.filter((p) => p.categoria === "B").length || 0
  const categoriaC = productos?.filter((p) => p.categoria === "C").length || 0

  const { data: alertas } = await supabase
    .from("alertas")
    .select("*")
    .eq("destinatario_id", user.id)
    .eq("leida", false)
    .limit(5)

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

  return (
    <DashboardLayout usuario={usuario} navigation={navigation}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "#0D2646" }}>
            Panel de Dirección General
          </h1>
          <p className="text-muted-foreground">Vista completa del sistema y control total</p>
        </div>

        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total Inventario</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: "#00BF63" }}>
                ${valorTotal.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">{totalProductos} productos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: "#487FBB" }}>
                {totalUsuarios || 0}
              </div>
              <p className="text-xs text-muted-foreground">En el sistema</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Solicitudes Pendientes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: "#0D2646" }}>
                {solicitudesPendientes || 0}
              </div>
              <p className="text-xs text-muted-foreground">Requieren atención</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertas Activas</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{alertas?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Sin leer</p>
            </CardContent>
          </Card>
        </div>

        {/* Distribución por categorías ABC */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Categorías ABC</CardTitle>
            <CardDescription>Clasificación del inventario según el método ABC</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border-2 bg-blue-50" style={{ borderColor: "#487FBB" }}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold" style={{ color: "#487FBB" }}>
                    Categoría A
                  </h3>
                  <Package className="h-5 w-5" style={{ color: "#487FBB" }} />
                </div>
                <p className="text-3xl font-bold" style={{ color: "#487FBB" }}>
                  {categoriaA}
                </p>
                <p className="text-sm" style={{ color: "#487FBB" }}>
                  Alta prioridad - Mayor valor
                </p>
              </div>

              <div className="p-4 rounded-lg border-2 bg-blue-50" style={{ borderColor: "#487FBB" }}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold" style={{ color: "#487FBB" }}>
                    Categoría B
                  </h3>
                  <Package className="h-5 w-5" style={{ color: "#487FBB" }} />
                </div>
                <p className="text-3xl font-bold" style={{ color: "#487FBB" }}>
                  {categoriaB}
                </p>
                <p className="text-sm" style={{ color: "#487FBB" }}>
                  Prioridad media - Valor moderado
                </p>
              </div>

              <div className="p-4 rounded-lg border-2 bg-blue-50" style={{ borderColor: "#487FBB" }}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold" style={{ color: "#487FBB" }}>
                    Categoría C
                  </h3>
                  <Package className="h-5 w-5" style={{ color: "#487FBB" }} />
                </div>
                <p className="text-3xl font-bold" style={{ color: "#487FBB" }}>
                  {categoriaC}
                </p>
                <p className="text-sm" style={{ color: "#487FBB" }}>
                  Baja prioridad - Menor valor
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alertas recientes */}
          <Card>
            <CardHeader>
              <CardTitle>Alertas del Sistema</CardTitle>
              <CardDescription>Notificaciones importantes</CardDescription>
            </CardHeader>
            <CardContent>
              {alertas && alertas.length > 0 ? (
                <div className="space-y-3">
                  {alertas.map((alerta) => (
                    <div key={alerta.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                      <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{alerta.tipo_alerta}</p>
                        <p className="text-sm text-muted-foreground">{alerta.mensaje}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No hay alertas pendientes</p>
              )}
            </CardContent>
          </Card>

          {/* Acciones rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>Funciones principales del director</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="/dashboard/director/staff?action=new"
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-muted transition-colors"
                >
                  <Users className="h-6 w-6" style={{ color: "#487FBB" }} />
                  <span className="text-sm font-medium text-center">Crear Usuario</span>
                </a>

                <a
                  href="/dashboard/director/solicitudes"
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-muted transition-colors"
                >
                  <FileText className="h-6 w-6" style={{ color: "#487FBB" }} />
                  <span className="text-sm font-medium text-center">Solicitudes</span>
                </a>

                <a
                  href="/dashboard/director/configuracion"
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-muted transition-colors"
                >
                  <Settings className="h-6 w-6" style={{ color: "#487FBB" }} />
                  <span className="text-sm font-medium text-center">Configuración</span>
                </a>

                <a
                  href="/dashboard/director/informes"
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-muted transition-colors"
                >
                  <TrendingUp className="h-6 w-6" style={{ color: "#487FBB" }} />
                  <span className="text-sm font-medium text-center">Informes</span>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

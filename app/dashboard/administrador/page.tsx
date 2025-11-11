import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, FileText, Users, TrendingUp, AlertCircle, BarChart3 } from "lucide-react"

export default async function AdministradorDashboardPage() {
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

  // Obtener estadísticas
  const { count: totalProductos } = await supabase.from("productos").select("*", { count: "exact", head: true })

  const { count: solicitudesPendientes } = await supabase
    .from("solicitudes")
    .select("*", { count: "exact", head: true })
    .eq("estado", "Pendiente")

  const { count: totalEmpleados } = await supabase
    .from("usuarios")
    .select("*", { count: "exact", head: true })
    .eq("tipo_usuario", "Empleado")

  const { data: alertas } = await supabase
    .from("alertas")
    .select("*")
    .eq("destinatario_id", user.id)
    .eq("leida", false)
    .limit(5)

  const { data: productosStockBajo } = await supabase
    .from("productos")
    .select("*")
    .lte("cantidad_disponible", "umbral_minimo")
    .limit(5)

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
            Panel de Administración
          </h1>
          <p className="text-muted-foreground">Gestiona el inventario, solicitudes y personal</p>
        </div>

        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: "#0D2646" }}>
                {totalProductos || 0}
              </div>
              <p className="text-xs text-muted-foreground">En el inventario</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Solicitudes Pendientes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: "#487FBB" }}>
                {solicitudesPendientes || 0}
              </div>
              <p className="text-xs text-muted-foreground">Requieren revisión</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Empleados</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: "#00BF63" }}>
                {totalEmpleados || 0}
              </div>
              <p className="text-xs text-muted-foreground">Personal activo</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Productos con stock bajo */}
          <Card>
            <CardHeader>
              <CardTitle>Productos con Stock Bajo</CardTitle>
              <CardDescription>Requieren atención inmediata</CardDescription>
            </CardHeader>
            <CardContent>
              {productosStockBajo && productosStockBajo.length > 0 ? (
                <div className="space-y-3">
                  {productosStockBajo.map((producto) => (
                    <div key={producto.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div>
                        <p className="font-medium">{producto.nombre}</p>
                        <p className="text-sm text-muted-foreground">
                          Stock: {producto.cantidad_disponible} / Mínimo: {producto.umbral_minimo}
                        </p>
                      </div>
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No hay productos con stock bajo</p>
              )}
            </CardContent>
          </Card>

          {/* Alertas recientes */}
          <Card>
            <CardHeader>
              <CardTitle>Alertas Recientes</CardTitle>
              <CardDescription>Notificaciones del sistema</CardDescription>
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
        </div>

        {/* Acciones rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Tareas administrativas comunes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <a
                href="/dashboard/administrador/solicitudes"
                className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted transition-colors"
              >
                <FileText className="h-8 w-8" style={{ color: "#487FBB" }} />
                <div>
                  <p className="font-medium">Revisar Solicitudes</p>
                  <p className="text-sm text-muted-foreground">{solicitudesPendientes || 0} pendientes</p>
                </div>
              </a>

              <a
                href="/dashboard/administrador/staff?action=new"
                className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted transition-colors"
              >
                <Users className="h-8 w-8" style={{ color: "#487FBB" }} />
                <div>
                  <p className="font-medium">Crear Empleado</p>
                  <p className="text-sm text-muted-foreground">Agregar nuevo usuario</p>
                </div>
              </a>

              <a
                href="/dashboard/administrador/catalogo?action=add"
                className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted transition-colors"
              >
                <Package className="h-8 w-8" style={{ color: "#487FBB" }} />
                <div>
                  <p className="font-medium">Agregar Producto</p>
                  <p className="text-sm text-muted-foreground">Registrar en inventario</p>
                </div>
              </a>

              <a
                href="/dashboard/administrador/informes"
                className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted transition-colors"
              >
                <TrendingUp className="h-8 w-8" style={{ color: "#487FBB" }} />
                <div>
                  <p className="font-medium">Ver Informes</p>
                  <p className="text-sm text-muted-foreground">Reportes y análisis</p>
                </div>
              </a>

              <a
                href="/dashboard/administrador/catalogo"
                className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted transition-colors"
              >
                <Package className="h-8 w-8" style={{ color: "#487FBB" }} />
                <div>
                  <p className="font-medium">Gestionar Inventario</p>
                  <p className="text-sm text-muted-foreground">Editar productos</p>
                </div>
              </a>

              <a
                href="/dashboard/perfil"
                className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted transition-colors"
              >
                <Users className="h-8 w-8" style={{ color: "#487FBB" }} />
                <div>
                  <p className="font-medium">Mi Perfil</p>
                  <p className="text-sm text-muted-foreground">Configuración personal</p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

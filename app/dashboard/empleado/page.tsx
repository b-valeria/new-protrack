import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, FileText, TrendingUp, AlertCircle } from "lucide-react"

export default async function EmpleadoDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: usuario } = await supabase.from("usuarios").select("*").eq("id", user.id).single()

  if (!usuario || usuario.tipo_usuario !== "Empleado") {
    redirect("/dashboard")
  }

  // Obtener estadísticas
  const { count: totalProductos } = await supabase.from("productos").select("*", { count: "exact", head: true })

  const { count: solicitudesPendientes } = await supabase
    .from("solicitudes")
    .select("*", { count: "exact", head: true })
    .eq("solicitado_por", user.id)
    .eq("estado", "Pendiente")

  const { data: alertas } = await supabase
    .from("alertas")
    .select("*")
    .eq("destinatario_id", user.id)
    .eq("leida", false)
    .limit(5)

  const navigation = [
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

  return (
    <DashboardLayout usuario={usuario} navigation={navigation}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "#0D2646" }}>
            Bienvenido, {usuario.nombre_completo}
          </h1>
          <p className="text-muted-foreground">Panel de control para empleados</p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <p className="text-xs text-muted-foreground">Esperando aprobación</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertas Activas</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: "#00BF63" }}>
                {alertas?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Sin leer</p>
            </CardContent>
          </Card>
        </div>

        {/* Alertas recientes */}
        {alertas && alertas.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Alertas Recientes</CardTitle>
              <CardDescription>Notificaciones importantes del sistema</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        )}

        {/* Acciones rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Tareas comunes del día a día</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="/dashboard/empleado/catalogo?action=add"
                className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted transition-colors"
              >
                <Package className="h-8 w-8" style={{ color: "#487FBB" }} />
                <div>
                  <p className="font-medium">Registrar Producto</p>
                  <p className="text-sm text-muted-foreground">Agregar nuevo producto al inventario</p>
                </div>
              </a>

              <a
                href="/dashboard/empleado/solicitudes?action=new"
                className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted transition-colors"
              >
                <FileText className="h-8 w-8" style={{ color: "#487FBB" }} />
                <div>
                  <p className="font-medium">Nueva Solicitud</p>
                  <p className="text-sm text-muted-foreground">Solicitar reabastecimiento o traslado</p>
                </div>
              </a>

              <a
                href="/dashboard/empleado/movimientos?action=register"
                className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted transition-colors"
              >
                <TrendingUp className="h-8 w-8" style={{ color: "#487FBB" }} />
                <div>
                  <p className="font-medium">Registrar Movimiento</p>
                  <p className="text-sm text-muted-foreground">Documentar traslados o devoluciones</p>
                </div>
              </a>

              <a
                href="/dashboard/perfil"
                className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted transition-colors"
              >
                <Package className="h-8 w-8" style={{ color: "#487FBB" }} />
                <div>
                  <p className="font-medium">Mi Perfil</p>
                  <p className="text-sm text-muted-foreground">Ver y editar información personal</p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

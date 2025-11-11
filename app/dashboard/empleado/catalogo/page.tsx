import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { CatalogoProductos } from "@/components/catalogo-productos"
import { Package, FileText, TrendingUp } from "lucide-react"

export default async function EmpleadoCatalogoPage() {
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
            Catálogo de Productos
          </h1>
          <p className="text-muted-foreground">Explora y gestiona el inventario de productos</p>
        </div>

        <CatalogoProductos showAddButton={true} />
      </div>
    </DashboardLayout>
  )
}

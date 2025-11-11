"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SolicitudForm } from "@/components/solicitud-form"
import { Plus, Clock, CheckCircle, XCircle } from "lucide-react"
import type { Solicitud, Producto, Usuario } from "@/lib/types"

export default function EmpleadoSolicitudesPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [showDialog, setShowDialog] = useState(false)
  const [tipoSolicitud, setTipoSolicitud] = useState<"Reabastecimiento" | "Traslado">("Reabastecimiento")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data: usuarioData } = await supabase.from("usuarios").select("*").eq("id", user.id).single()

      if (!usuarioData || usuarioData.tipo_usuario !== "Empleado") {
        router.push("/dashboard")
        return
      }

      setUsuario(usuarioData)

      const { data: solicitudesData } = await supabase
        .from("solicitudes")
        .select("*")
        .eq("solicitado_por", user.id)
        .order("created_at", { ascending: false })

      setSolicitudes(solicitudesData || [])

      const { data: productosData } = await supabase.from("productos").select("*").order("nombre")

      setProductos(productosData || [])
    } catch (error) {
      console.error("[v0] Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Pendiente":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case "Aprobada":
        return <Badge className="bg-green-100 text-green-800">Aprobada</Badge>
      case "Rechazada":
        return <Badge className="bg-red-100 text-red-800">Rechazada</Badge>
      case "Delegada":
        return <Badge className="bg-blue-100 text-blue-800">Delegada</Badge>
      default:
        return <Badge>{estado}</Badge>
    }
  }

  const pendientes = solicitudes.filter((s) => s.estado === "Pendiente")
  const aprobadas = solicitudes.filter((s) => s.estado === "Aprobada")
  const rechazadas = solicitudes.filter((s) => s.estado === "Rechazada")

  if (!usuario) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "#0D2646" }}>
            Mis Solicitudes
          </h1>
          <p className="text-muted-foreground">Gestiona tus solicitudes de reabastecimiento y traslado</p>
        </div>
        <Button
          onClick={() => {
            setTipoSolicitud("Reabastecimiento")
            setShowDialog(true)
          }}
          style={{ backgroundColor: "#00BF63", color: "#FFFFFF" }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Solicitud
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendientes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprobadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aprobadas.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rechazadas</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rechazadas.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="todas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
          <TabsTrigger value="aprobadas">Aprobadas</TabsTrigger>
          <TabsTrigger value="rechazadas">Rechazadas</TabsTrigger>
        </TabsList>

        <TabsContent value="todas" className="space-y-4">
          {solicitudes.map((solicitud) => (
            <Card key={solicitud.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{solicitud.nombre_producto}</CardTitle>
                    <CardDescription>
                      {solicitud.tipo_solicitud} - {new Date(solicitud.fecha_solicitud).toLocaleDateString("es-ES")}
                    </CardDescription>
                  </div>
                  {getEstadoBadge(solicitud.estado)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cantidad:</span>
                    <span className="font-medium">{solicitud.cantidad_solicitada} unidades</span>
                  </div>
                  {solicitud.motivo && (
                    <div>
                      <span className="text-muted-foreground">Motivo:</span>
                      <p className="mt-1">{solicitud.motivo}</p>
                    </div>
                  )}
                  {solicitud.notas_revision && (
                    <div>
                      <span className="text-muted-foreground">Notas de revisión:</span>
                      <p className="mt-1">{solicitud.notas_revision}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="pendientes" className="space-y-4">
          {pendientes.map((solicitud) => (
            <Card key={solicitud.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{solicitud.nombre_producto}</CardTitle>
                    <CardDescription>
                      {solicitud.tipo_solicitud} - {new Date(solicitud.fecha_solicitud).toLocaleDateString("es-ES")}
                    </CardDescription>
                  </div>
                  {getEstadoBadge(solicitud.estado)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cantidad:</span>
                    <span className="font-medium">{solicitud.cantidad_solicitada} unidades</span>
                  </div>
                  {solicitud.motivo && (
                    <div>
                      <span className="text-muted-foreground">Motivo:</span>
                      <p className="mt-1">{solicitud.motivo}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="aprobadas" className="space-y-4">
          {aprobadas.map((solicitud) => (
            <Card key={solicitud.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{solicitud.nombre_producto}</CardTitle>
                    <CardDescription>
                      {solicitud.tipo_solicitud} - {new Date(solicitud.fecha_solicitud).toLocaleDateString("es-ES")}
                    </CardDescription>
                  </div>
                  {getEstadoBadge(solicitud.estado)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cantidad:</span>
                    <span className="font-medium">{solicitud.cantidad_solicitada} unidades</span>
                  </div>
                  {solicitud.notas_revision && (
                    <div>
                      <span className="text-muted-foreground">Notas de revisión:</span>
                      <p className="mt-1">{solicitud.notas_revision}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="rechazadas" className="space-y-4">
          {rechazadas.map((solicitud) => (
            <Card key={solicitud.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{solicitud.nombre_producto}</CardTitle>
                    <CardDescription>
                      {solicitud.tipo_solicitud} - {new Date(solicitud.fecha_solicitud).toLocaleDateString("es-ES")}
                    </CardDescription>
                  </div>
                  {getEstadoBadge(solicitud.estado)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cantidad:</span>
                    <span className="font-medium">{solicitud.cantidad_solicitada} unidades</span>
                  </div>
                  {solicitud.notas_revision && (
                    <div>
                      <span className="text-muted-foreground">Motivo del rechazo:</span>
                      <p className="mt-1">{solicitud.notas_revision}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nueva Solicitud de {tipoSolicitud}</DialogTitle>
            <DialogDescription>Completa el formulario para solicitar {tipoSolicitud.toLowerCase()}</DialogDescription>
          </DialogHeader>
          <SolicitudForm
            productos={productos}
            tipo={tipoSolicitud}
            onSuccess={() => {
              setShowDialog(false)
              loadData()
            }}
            onCancel={() => setShowDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

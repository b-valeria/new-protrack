"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, Clock, Send, Inbox } from "lucide-react"
import type { Solicitud, Usuario } from "@/lib/types"

interface DirectorSolicitudesContentProps {
  initialSolicitudes: Solicitud[]
  usuario: Usuario
}

export function DirectorSolicitudesContent({ initialSolicitudes, usuario }: DirectorSolicitudesContentProps) {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>(initialSolicitudes)
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [accion, setAccion] = useState<"aprobar" | "rechazar">("aprobar")
  const [notasRevision, setNotasRevision] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const loadData = async () => {
    const supabase = createClient()

    try {
      const { data: solicitudesData } = await supabase
        .from("solicitudes")
        .select("*")
        .in("estado", ["Pendiente", "Delegada"])
        .order("created_at", { ascending: false })

      setSolicitudes(solicitudesData || [])
    } catch (error) {
      console.error("[v0] Error loading data:", error)
    }
  }

  const handleAccion = async () => {
    if (!selectedSolicitud) return

    const supabase = createClient()
    setIsProcessing(true)

    try {
      const nuevoEstado: "Aprobada" | "Rechazada" = accion === "aprobar" ? "Aprobada" : "Rechazada"

      const { error } = await supabase
        .from("solicitudes")
        .update({
          estado: nuevoEstado,
          revisado_por: usuario.id,
          fecha_revision: new Date().toISOString(),
          notas_revision: notasRevision || null,
        })
        .eq("id", selectedSolicitud.id)

      if (error) throw error

      setShowDialog(false)
      setNotasRevision("")
      setSelectedSolicitud(null)
      loadData()
    } catch (error) {
      console.error("[v0] Error processing solicitud:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const openDialog = (solicitud: Solicitud, accionType: "aprobar" | "rechazar") => {
    setSelectedSolicitud(solicitud)
    setAccion(accionType)
    setShowDialog(true)
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Pendiente":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        )
      case "Delegada":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Send className="h-3 w-3 mr-1" />
            Delegada
          </Badge>
        )
      default:
        return <Badge>{estado}</Badge>
    }
  }

  const pendientes = solicitudes.filter((s) => s.estado === "Pendiente")
  const delegadas = solicitudes.filter((s) => s.estado === "Delegada")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: "#0D2646" }}>
          Buzón de Solicitudes
        </h1>
        <p className="text-muted-foreground">Solicitudes pendientes y delegadas que requieren tu atención</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total en Buzón</CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "#0D2646" }}>
              {solicitudes.length}
            </div>
            <p className="text-xs text-muted-foreground">Requieren atención</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendientes.length}</div>
            <p className="text-xs text-muted-foreground">Nuevas solicitudes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delegadas</CardTitle>
            <Send className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{delegadas.length}</div>
            <p className="text-xs text-muted-foreground">Por administradores</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pendientes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pendientes">
            <Clock className="h-4 w-4 mr-2" />
            Pendientes ({pendientes.length})
          </TabsTrigger>
          <TabsTrigger value="delegadas">
            <Send className="h-4 w-4 mr-2" />
            Delegadas ({delegadas.length})
          </TabsTrigger>
          <TabsTrigger value="todas">
            <Inbox className="h-4 w-4 mr-2" />
            Todas ({solicitudes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pendientes" className="space-y-4">
          {pendientes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No hay solicitudes pendientes</p>
                <p className="text-sm text-muted-foreground mt-2">Todas las solicitudes han sido procesadas</p>
              </CardContent>
            </Card>
          ) : (
            pendientes.map((solicitud) => (
              <Card key={solicitud.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{solicitud.nombre_producto}</CardTitle>
                      <CardDescription className="mt-1">
                        <span className="font-medium">{solicitud.tipo_solicitud}</span> •{" "}
                        {new Date(solicitud.fecha_solicitud).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </CardDescription>
                    </div>
                    {getEstadoBadge(solicitud.estado)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Cantidad solicitada:</span>
                        <p className="font-semibold text-lg mt-1">{solicitud.cantidad_solicitada} unidades</p>
                      </div>
                    </div>
                    {solicitud.motivo && (
                      <div className="p-3 bg-muted rounded-lg">
                        <span className="text-sm font-medium text-muted-foreground">Motivo:</span>
                        <p className="mt-1 text-sm">{solicitud.motivo}</p>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => openDialog(solicitud, "aprobar")}
                        style={{ backgroundColor: "#00BF63", color: "#FFFFFF" }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aprobar
                      </Button>
                      <Button variant="outline" onClick={() => openDialog(solicitud, "rechazar")}>
                        <XCircle className="h-4 w-4 mr-2" />
                        Rechazar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="delegadas" className="space-y-4">
          {delegadas.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Send className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No hay solicitudes delegadas</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Los administradores no han delegado ninguna solicitud
                </p>
              </CardContent>
            </Card>
          ) : (
            delegadas.map((solicitud) => (
              <Card key={solicitud.id} className="hover:shadow-md transition-shadow border-blue-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{solicitud.nombre_producto}</CardTitle>
                      <CardDescription className="mt-1">
                        <span className="font-medium">{solicitud.tipo_solicitud}</span> •{" "}
                        {new Date(solicitud.fecha_solicitud).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </CardDescription>
                    </div>
                    {getEstadoBadge(solicitud.estado)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Cantidad solicitada:</span>
                        <p className="font-semibold text-lg mt-1">{solicitud.cantidad_solicitada} unidades</p>
                      </div>
                    </div>
                    {solicitud.motivo && (
                      <div className="p-3 bg-muted rounded-lg">
                        <span className="text-sm font-medium text-muted-foreground">Motivo:</span>
                        <p className="mt-1 text-sm">{solicitud.motivo}</p>
                      </div>
                    )}
                    {solicitud.notas_revision && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <span className="text-sm font-medium" style={{ color: "#487FBB" }}>
                          Notas del administrador:
                        </span>
                        <p className="mt-1 text-sm">{solicitud.notas_revision}</p>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => openDialog(solicitud, "aprobar")}
                        style={{ backgroundColor: "#00BF63", color: "#FFFFFF" }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aprobar
                      </Button>
                      <Button variant="outline" onClick={() => openDialog(solicitud, "rechazar")}>
                        <XCircle className="h-4 w-4 mr-2" />
                        Rechazar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="todas" className="space-y-4">
          {solicitudes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">El buzón está vacío</p>
                <p className="text-sm text-muted-foreground mt-2">No hay solicitudes que requieran tu atención</p>
              </CardContent>
            </Card>
          ) : (
            solicitudes.map((solicitud) => (
              <Card key={solicitud.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{solicitud.nombre_producto}</CardTitle>
                      <CardDescription className="mt-1">
                        <span className="font-medium">{solicitud.tipo_solicitud}</span> •{" "}
                        {new Date(solicitud.fecha_solicitud).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </CardDescription>
                    </div>
                    {getEstadoBadge(solicitud.estado)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Cantidad solicitada:</span>
                        <p className="font-semibold text-lg mt-1">{solicitud.cantidad_solicitada} unidades</p>
                      </div>
                    </div>
                    {solicitud.motivo && (
                      <div className="p-3 bg-muted rounded-lg">
                        <span className="text-sm font-medium text-muted-foreground">Motivo:</span>
                        <p className="mt-1 text-sm">{solicitud.motivo}</p>
                      </div>
                    )}
                    {solicitud.notas_revision && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <span className="text-sm font-medium" style={{ color: "#487FBB" }}>
                          Notas del administrador:
                        </span>
                        <p className="mt-1 text-sm">{solicitud.notas_revision}</p>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => openDialog(solicitud, "aprobar")}
                        style={{ backgroundColor: "#00BF63", color: "#FFFFFF" }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aprobar
                      </Button>
                      <Button variant="outline" onClick={() => openDialog(solicitud, "rechazar")}>
                        <XCircle className="h-4 w-4 mr-2" />
                        Rechazar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {accion === "aprobar" ? "Aprobar Solicitud" : "Rechazar Solicitud"}
            </DialogTitle>
            <DialogDescription className="text-base">
              <span className="font-medium">{selectedSolicitud?.nombre_producto}</span> •{" "}
              {selectedSolicitud?.cantidad_solicitada} unidades
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="notas" className="text-base">
                Notas de revisión {accion === "rechazar" ? "(requerido)" : "(opcional)"}
              </Label>
              <Textarea
                id="notas"
                rows={4}
                value={notasRevision}
                onChange={(e) => setNotasRevision(e.target.value)}
                placeholder={
                  accion === "aprobar"
                    ? "Agregar comentarios sobre la aprobación..."
                    : "Explica el motivo del rechazo..."
                }
                className="mt-2"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleAccion}
                disabled={isProcessing || (accion === "rechazar" && !notasRevision)}
                style={{
                  backgroundColor: accion === "aprobar" ? "#00BF63" : "#0D2646",
                  color: "#FFFFFF",
                }}
              >
                {isProcessing ? "Procesando..." : accion === "aprobar" ? "Aprobar Solicitud" : "Rechazar Solicitud"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

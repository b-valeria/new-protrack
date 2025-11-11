"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, XCircle, Clock, Send, Plus, Truck } from "lucide-react"
import { SolicitudForm } from "@/components/solicitud-form"
import type { Solicitud, Usuario, Producto } from "@/lib/types"

interface AdministradorSolicitudesContentProps {
  usuario: Usuario
  solicitudesIniciales: Solicitud[]
  productos: Producto[]
}

export function AdministradorSolicitudesContent({
  usuario,
  solicitudesIniciales,
  productos,
}: AdministradorSolicitudesContentProps) {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>(solicitudesIniciales)
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [showNuevaSolicitudDialog, setShowNuevaSolicitudDialog] = useState(false)
  const [showCoordinarTrasladoDialog, setShowCoordinarTrasladoDialog] = useState(false)
  const [tipoNuevaSolicitud, setTipoNuevaSolicitud] = useState<"Reabastecimiento" | "Traslado" | "Donación">(
    "Reabastecimiento",
  )
  const [accion, setAccion] = useState<"aprobar" | "rechazar" | "delegar">("aprobar")
  const [notasRevision, setNotasRevision] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const [trasladoData, setTrasladoData] = useState({
    sede_origen: "",
    sede_destino: "",
    fecha: "",
    encargado: "",
  })

  const loadSolicitudes = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("solicitudes").select("*").order("created_at", { ascending: false })
    if (data) setSolicitudes(data)
  }

  const handleAccion = async () => {
    if (!selectedSolicitud) return

    const supabase = createClient()
    setIsProcessing(true)

    try {
      let nuevoEstado: "Aprobada" | "Rechazada" | "Delegada" = "Aprobada"

      if (accion === "rechazar") {
        nuevoEstado = "Rechazada"
      } else if (accion === "delegar") {
        nuevoEstado = "Delegada"
      }

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

      if (nuevoEstado === "Aprobada" && selectedSolicitud.tipo_solicitud === "Traslado") {
        setShowDialog(false)
        setShowCoordinarTrasladoDialog(true)
        return
      }

      setShowDialog(false)
      setNotasRevision("")
      setSelectedSolicitud(null)
      loadSolicitudes()
    } catch (error) {
      console.error("[v0] Error processing solicitud:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCoordinarTraslado = async () => {
    if (!selectedSolicitud) return

    const supabase = createClient()
    setIsProcessing(true)

    try {
      const { error } = await supabase.from("traslados").insert({
        nombre_producto: selectedSolicitud.nombre_producto,
        sede_origen: trasladoData.sede_origen,
        sede_destino: trasladoData.sede_destino,
        fecha: trasladoData.fecha,
        motivo: selectedSolicitud.motivo || "",
        encargado: trasladoData.encargado,
      })

      if (error) throw error

      setShowCoordinarTrasladoDialog(false)
      setTrasladoData({ sede_origen: "", sede_destino: "", fecha: "", encargado: "" })
      setSelectedSolicitud(null)
      loadSolicitudes()

      alert("✅ Traslado coordinado exitosamente")
    } catch (error) {
      console.error("[v0] Error coordinating traslado:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const openDialog = (solicitud: Solicitud, accionType: "aprobar" | "rechazar" | "delegar") => {
    setSelectedSolicitud(solicitud)
    setAccion(accionType)
    setShowDialog(true)
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

  const pendientes = solicitudes.filter((s) => s.estado === "Pendiente" && s.solicitado_por !== usuario.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "#0D2646" }}>
            Gestión de Solicitudes
          </h1>
          <p className="text-muted-foreground">Revisa, aprueba y crea solicitudes</p>
        </div>
        <Button
          onClick={() => setShowNuevaSolicitudDialog(true)}
          className="text-white cursor-pointer hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#487FBB" }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Solicitud
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
            <div className="text-2xl font-bold">{solicitudes.filter((s) => s.estado === "Aprobada").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rechazadas</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{solicitudes.filter((s) => s.estado === "Rechazada").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delegadas</CardTitle>
            <Send className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{solicitudes.filter((s) => s.estado === "Delegada").length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pendientes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pendientes" className="cursor-pointer">
            Pendientes
          </TabsTrigger>
          <TabsTrigger value="todas" className="cursor-pointer">
            Todas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pendientes" className="space-y-4">
          {pendientes.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No hay solicitudes pendientes de otros usuarios</p>
              </CardContent>
            </Card>
          ) : (
            pendientes.map((solicitud) => (
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
                  <div className="space-y-4">
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
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => openDialog(solicitud, "aprobar")}
                        className="bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDialog(solicitud, "rechazar")}
                        className="cursor-pointer"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rechazar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDialog(solicitud, "delegar")}
                        className="cursor-pointer"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Delegar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

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
      </Tabs>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {accion === "aprobar" && "Aprobar Solicitud"}
              {accion === "rechazar" && "Rechazar Solicitud"}
              {accion === "delegar" && "Delegar Solicitud"}
            </DialogTitle>
            <DialogDescription>
              {selectedSolicitud?.nombre_producto} - {selectedSolicitud?.cantidad_solicitada} unidades
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="notas">Notas {accion === "rechazar" ? "(requerido)" : "(opcional)"}</Label>
              <Textarea
                id="notas"
                rows={4}
                value={notasRevision}
                onChange={(e) => setNotasRevision(e.target.value)}
                placeholder={
                  accion === "aprobar"
                    ? "Agregar comentarios sobre la aprobación..."
                    : accion === "rechazar"
                      ? "Explica el motivo del rechazo..."
                      : "Agregar comentarios para el Director General..."
                }
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowDialog(false)} className="cursor-pointer">
                Cancelar
              </Button>
              <Button
                onClick={handleAccion}
                disabled={isProcessing || (accion === "rechazar" && !notasRevision)}
                className="cursor-pointer"
                style={{
                  backgroundColor: accion === "aprobar" ? "#00BF63" : "#0D2646",
                  color: "#FFFFFF",
                }}
              >
                {isProcessing
                  ? "Procesando..."
                  : accion === "aprobar"
                    ? "Aprobar"
                    : accion === "rechazar"
                      ? "Rechazar"
                      : "Delegar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showNuevaSolicitudDialog} onOpenChange={setShowNuevaSolicitudDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nueva Solicitud</DialogTitle>
            <DialogDescription>Crea una nueva solicitud de producto</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tipo-solicitud">Tipo de Solicitud *</Label>
              <Select value={tipoNuevaSolicitud} onValueChange={(v) => setTipoNuevaSolicitud(v as any)}>
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="Selecciona el tipo de solicitud" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Reabastecimiento" className="cursor-pointer">
                    Reabastecimiento
                  </SelectItem>
                  <SelectItem value="Traslado" className="cursor-pointer">
                    Traslado
                  </SelectItem>
                  <SelectItem value="Donación" className="cursor-pointer">
                    Donación
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <SolicitudForm
              productos={productos}
              tipo={tipoNuevaSolicitud}
              onSuccess={() => {
                setShowNuevaSolicitudDialog(false)
                loadSolicitudes()
              }}
              onCancel={() => setShowNuevaSolicitudDialog(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCoordinarTrasladoDialog} onOpenChange={setShowCoordinarTrasladoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>✅ Solicitud Aprobada - Coordinar Traslado</DialogTitle>
            <DialogDescription>
              Ingresa los detalles del traslado para {selectedSolicitud?.nombre_producto}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sede_origen">Sede de Origen *</Label>
              <Input
                id="sede_origen"
                value={trasladoData.sede_origen}
                onChange={(e) => setTrasladoData({ ...trasladoData, sede_origen: e.target.value })}
                placeholder="Almacén de origen"
              />
            </div>
            <div>
              <Label htmlFor="sede_destino">Sede de Destino *</Label>
              <Input
                id="sede_destino"
                value={trasladoData.sede_destino}
                onChange={(e) => setTrasladoData({ ...trasladoData, sede_destino: e.target.value })}
                placeholder="Almacén de destino"
              />
            </div>
            <div>
              <Label htmlFor="fecha">Fecha del Traslado *</Label>
              <Input
                id="fecha"
                type="date"
                value={trasladoData.fecha}
                onChange={(e) => setTrasladoData({ ...trasladoData, fecha: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="encargado">Encargado *</Label>
              <Input
                id="encargado"
                value={trasladoData.encargado}
                onChange={(e) => setTrasladoData({ ...trasladoData, encargado: e.target.value })}
                placeholder="Nombre del encargado"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowCoordinarTrasladoDialog(false)}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCoordinarTraslado}
                disabled={
                  isProcessing ||
                  !trasladoData.sede_origen ||
                  !trasladoData.sede_destino ||
                  !trasladoData.fecha ||
                  !trasladoData.encargado
                }
                className="bg-green-600 hover:bg-green-700 text-white cursor-pointer"
              >
                <Truck className="h-4 w-4 mr-2" />
                {isProcessing ? "Coordinando..." : "Coordinar Traslado"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

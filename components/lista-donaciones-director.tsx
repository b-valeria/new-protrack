"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle2, XCircle, Clock, Package } from 'lucide-react'

interface Donacion {
  id: string
  producto_id: string
  nombre_producto: string
  cantidad_donada: number
  sede_salida: string
  organizacion_receptora: string
  fecha: string
  estado: string
  solicitado_por: string
  created_at: string
}

interface Usuario {
  id: string
  nombre_completo: string
}

export function ListaDonacionesDirector({ usuario }: { usuario: Usuario }) {
  const [donaciones, setDonaciones] = useState<Donacion[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogAbierto, setDialogAbierto] = useState(false)
  const [donacionSeleccionada, setDonacionSeleccionada] = useState<Donacion | null>(null)
  const [accion, setAccion] = useState<"aprobar" | "rechazar" | null>(null)
  const [procesando, setProcesando] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    cargarDonaciones()

    // Suscripción a cambios en tiempo real
    const channel = supabase
      .channel("donaciones_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "donaciones" }, () => {
        cargarDonaciones()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const cargarDonaciones = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("donaciones")
      .select(`
        *,
        usuarios!donaciones_solicitado_por_fkey(nombre_completo)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error al cargar donaciones:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las donaciones",
        variant: "destructive",
      })
    } else {
      setDonaciones(data || [])
    }
    setLoading(false)
  }

  const abrirDialog = (donacion: Donacion, tipoAccion: "aprobar" | "rechazar") => {
    setDonacionSeleccionada(donacion)
    setAccion(tipoAccion)
    setDialogAbierto(true)
  }

  const procesarDonacion = async () => {
    if (!donacionSeleccionada || !accion) return

    setProcesando(true)

    try {
      const nuevoEstado = accion === "aprobar" ? "Aprobado" : "Denegado"

      const { error: errorDonacion } = await supabase
        .from("donaciones")
        .update({
          estado: nuevoEstado,
        })
        .eq("id", donacionSeleccionada.id)

      if (errorDonacion) throw errorDonacion

      if (accion === "aprobar") {
        const { error: errorContabilidad } = await supabase.from("contabilidad").insert({
          producto_id: donacionSeleccionada.producto_id,
          nombre_producto: donacionSeleccionada.nombre_producto,
          tipo_movimiento: "Donación",
          fecha: new Date().toISOString(),
          precio_venta: 0,
          unidades_vendidas: donacionSeleccionada.cantidad_donada,
        })

        if (errorContabilidad) {
          console.error("Error al registrar en contabilidad:", errorContabilidad)
        }

        // Actualizar inventario restando la cantidad donada
        const { data: producto } = await supabase
          .from("productos")
          .select("cantidad_disponible")
          .eq("id", donacionSeleccionada.producto_id)
          .single()

        if (producto) {
          const { error: errorInventario } = await supabase
            .from("productos")
            .update({
              cantidad_disponible: producto.cantidad_disponible - donacionSeleccionada.cantidad_donada,
            })
            .eq("id", donacionSeleccionada.producto_id)

          if (errorInventario) {
            console.error("Error al actualizar inventario:", errorInventario)
          }
        }
      }

      toast({
        title: accion === "aprobar" ? "Donación aprobada" : "Donación rechazada",
        description: `La donación ha sido ${accion === "aprobar" ? "aprobada" : "rechazada"} correctamente`,
      })

      setDialogAbierto(false)
      cargarDonaciones()
    } catch (error) {
      console.error("Error al procesar donación:", error)
      toast({
        title: "Error",
        description: "No se pudo procesar la donación",
        variant: "destructive",
      })
    } finally {
      setProcesando(false)
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Pendiente":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Clock className="mr-1 h-3 w-3" />Pendiente</Badge>
      case "Aprobado":
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle2 className="mr-1 h-3 w-3" />Aprobado</Badge>
      case "Denegado":
        return <Badge className="bg-red-500 hover:bg-red-600"><XCircle className="mr-1 h-3 w-3" />Denegado</Badge>
      default:
        return <Badge>{estado}</Badge>
    }
  }

  const pendientes = donaciones.filter((d) => d.estado === "Pendiente")
  const procesadas = donaciones.filter((d) => d.estado !== "Pendiente")

  if (loading) {
    return <div className="text-center py-8">Cargando donaciones...</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendientes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Aprobadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {donaciones.filter((d) => d.estado === "Aprobado").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Rechazadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {donaciones.filter((d) => d.estado === "Denegado").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {pendientes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Solicitudes Pendientes</CardTitle>
            <CardDescription>Revisa y aprueba o rechaza las solicitudes de donación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendientes.map((donacion) => (
              <Card key={donacion.id} className="border-l-4 border-l-yellow-500">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-semibold">{donacion.nombre_producto}</h3>
                        {getEstadoBadge(donacion.estado)}
                      </div>
                      <div className="grid gap-1 text-sm">
                        <p>
                          <span className="font-medium">Cantidad:</span> {donacion.cantidad_donada} unidades
                        </p>
                        <p>
                          <span className="font-medium">Sede de salida:</span> {donacion.sede_salida}
                        </p>
                        <p>
                          <span className="font-medium">Organización receptora:</span> {donacion.organizacion_receptora}
                        </p>
                        <p>
                          <span className="font-medium">Fecha:</span>{" "}
                          {new Date(donacion.fecha).toLocaleDateString()}
                        </p>
                        <p>
                          <span className="font-medium">Solicitado por:</span> {(donacion as any).usuarios?.nombre_completo || "Usuario desconocido"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:bg-green-50"
                        onClick={() => abrirDialog(donacion, "aprobar")}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => abrirDialog(donacion, "rechazar")}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Rechazar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {procesadas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historial de Donaciones</CardTitle>
            <CardDescription>Donaciones ya procesadas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {procesadas.map((donacion) => (
              <Card key={donacion.id}>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-semibold">{donacion.nombre_producto}</h3>
                      {getEstadoBadge(donacion.estado)}
                    </div>
                    <div className="grid gap-1 text-sm">
                      <p>
                        <span className="font-medium">Cantidad:</span> {donacion.cantidad_donada} unidades
                      </p>
                      <p>
                        <span className="font-medium">Sede de salida:</span> {donacion.sede_salida}
                      </p>
                      <p>
                        <span className="font-medium">Organización receptora:</span> {donacion.organizacion_receptora}
                      </p>
                      <p>
                        <span className="font-medium">Fecha donación:</span>{" "}
                        {new Date(donacion.fecha).toLocaleDateString()}
                      </p>
                      <p>
                        <span className="font-medium">Solicitado por:</span> {(donacion as any).usuarios?.nombre_completo || "Usuario desconocido"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {accion === "aprobar" ? "Aprobar Donación" : "Rechazar Donación"}
            </DialogTitle>
            <DialogDescription>
              {donacionSeleccionada && (
                <>
                  {accion === "aprobar"
                    ? "¿Estás seguro de aprobar esta donación? Se registrará en contabilidad y se actualizará el inventario."
                    : "¿Estás seguro de rechazar esta donación?"}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {donacionSeleccionada && (
            <div className="space-y-2 rounded-lg bg-muted p-4">
              <p>
                <span className="font-medium">Producto:</span> {donacionSeleccionada.nombre_producto}
              </p>
              <p>
                <span className="font-medium">Cantidad:</span> {donacionSeleccionada.cantidad_donada} unidades
              </p>
              <p>
                <span className="font-medium">Sede de salida:</span> {donacionSeleccionada.sede_salida}
              </p>
              <p>
                <span className="font-medium">Organización receptora:</span> {donacionSeleccionada.organizacion_receptora}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAbierto(false)} disabled={procesando}>
              Cancelar
            </Button>
            <Button
              onClick={procesarDonacion}
              disabled={procesando}
              className={accion === "aprobar" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {procesando ? "Procesando..." : accion === "aprobar" ? "Aprobar" : "Rechazar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

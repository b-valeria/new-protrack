"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Package, TrendingDown, ArrowRightLeft } from "lucide-react"
import { toast } from "sonner"

interface Movimiento {
  id: string
  tipo_movimiento: "Traslado" | "Devolución" | "Pérdida" | "Venta"
  producto_id: string
  producto_nombre: string
  cantidad: number
  sede_origen?: string
  sede_destino?: string
  motivo?: string
  precio_venta?: number
  registrado_por: string
  fecha_movimiento: string
  created_at: string
}

interface Producto {
  id: string
  nombre: string
  cantidad_disponible: number
  ubicacion: string
}

export function RegistroMovimientosContent({ usuarioId }: { usuarioId: string }) {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [showDialog, setShowDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    tipo_movimiento: "Traslado" as "Traslado" | "Devolución" | "Pérdida" | "Venta",
    producto_id: "",
    cantidad: "",
    sede_origen: "",
    sede_destino: "",
    motivo: "",
    precio_venta: "",
    fecha_movimiento: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      // Cargar movimientos
      const { data: movimientosData } = await supabase
        .from("movimientos")
        .select("*, productos(nombre)")
        .order("fecha_movimiento", { ascending: false })

      // Cargar productos disponibles
      const { data: productosData } = await supabase
        .from("productos")
        .select("id, nombre, cantidad_disponible, ubicacion")

      setMovimientos(
        (movimientosData || []).map((m: any) => ({
          ...m,
          producto_nombre: m.productos?.nombre || "Producto desconocido",
        })),
      )
      setProductos(productosData || [])
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Error al cargar los datos")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)

    try {
      const producto = productos.find((p) => p.id === formData.producto_id)
      if (!producto) {
        toast.error("Producto no encontrado")
        return
      }

      const cantidad = Number.parseInt(formData.cantidad)
      if (cantidad > producto.cantidad_disponible) {
        toast.error("Cantidad insuficiente en inventario")
        return
      }

      // Crear el movimiento
      const { error: movimientoError } = await supabase.from("movimientos").insert({
        tipo_movimiento: formData.tipo_movimiento,
        producto_id: formData.producto_id,
        cantidad: cantidad,
        sede_origen: formData.sede_origen || producto.ubicacion,
        sede_destino: formData.sede_destino || null,
        motivo: formData.motivo || null,
        precio_venta: formData.precio_venta ? Number.parseFloat(formData.precio_venta) : null,
        registrado_por: usuarioId,
        fecha_movimiento: formData.fecha_movimiento,
      })

      if (movimientoError) throw movimientoError

      // Actualizar cantidad disponible del producto
      const nuevaCantidad = producto.cantidad_disponible - cantidad
      const { error: updateError } = await supabase
        .from("productos")
        .update({ cantidad_disponible: nuevaCantidad })
        .eq("id", formData.producto_id)

      if (updateError) throw updateError

      toast.success("Movimiento registrado exitosamente")
      setShowDialog(false)
      resetForm()
      loadData()
    } catch (error) {
      console.error("Error registering movement:", error)
      toast.error("Error al registrar el movimiento")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      tipo_movimiento: "Traslado",
      producto_id: "",
      cantidad: "",
      sede_origen: "",
      sede_destino: "",
      motivo: "",
      precio_venta: "",
      fecha_movimiento: new Date().toISOString().split("T")[0],
    })
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "Traslado":
        return <ArrowRightLeft className="h-4 w-4" />
      case "Devolución":
        return <TrendingDown className="h-4 w-4" />
      case "Pérdida":
        return <Package className="h-4 w-4" />
      case "Venta":
        return <Package className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getTipoBadgeColor = (tipo: string) => {
    switch (tipo) {
      case "Traslado":
        return "bg-blue-500"
      case "Devolución":
        return "bg-yellow-500"
      case "Pérdida":
        return "bg-red-500"
      case "Venta":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "#0D2646" }}>
            Registro de Movimientos
          </h1>
          <p className="text-muted-foreground">Documenta traslados, devoluciones, pérdidas y ventas</p>
        </div>
        <Button
          onClick={() => setShowDialog(true)}
          style={{ backgroundColor: "#487FBB" }}
          className="text-white hover:opacity-90 cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          Registrar Movimiento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Movimientos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{movimientos.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Traslados</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {movimientos.filter((m) => m.tipo_movimiento === "Traslado").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{movimientos.filter((m) => m.tipo_movimiento === "Venta").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pérdidas</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {movimientos.filter((m) => m.tipo_movimiento === "Pérdida").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Movimientos</CardTitle>
          <CardDescription>Registro completo de todos los movimientos de inventario</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Origen</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Motivo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movimientos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No hay movimientos registrados
                  </TableCell>
                </TableRow>
              ) : (
                movimientos.map((movimiento) => (
                  <TableRow key={movimiento.id}>
                    <TableCell>
                      <Badge className={`${getTipoBadgeColor(movimiento.tipo_movimiento)} text-white`}>
                        <span className="flex items-center gap-1">
                          {getTipoIcon(movimiento.tipo_movimiento)}
                          {movimiento.tipo_movimiento}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>{movimiento.producto_nombre}</TableCell>
                    <TableCell>{movimiento.cantidad}</TableCell>
                    <TableCell>{movimiento.sede_origen || "-"}</TableCell>
                    <TableCell>{movimiento.sede_destino || "-"}</TableCell>
                    <TableCell>{new Date(movimiento.fecha_movimiento).toLocaleDateString()}</TableCell>
                    <TableCell className="max-w-xs truncate">{movimiento.motivo || "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Movimiento</DialogTitle>
            <DialogDescription>Completa la información del movimiento de inventario</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="tipo_movimiento">Tipo de Movimiento *</Label>
                <Select
                  value={formData.tipo_movimiento}
                  onValueChange={(value) => setFormData({ ...formData, tipo_movimiento: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Traslado">Traslado</SelectItem>
                    <SelectItem value="Devolución">Devolución</SelectItem>
                    <SelectItem value="Pérdida">Pérdida</SelectItem>
                    <SelectItem value="Venta">Venta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Label htmlFor="producto_id">Producto *</Label>
                <Select
                  value={formData.producto_id}
                  onValueChange={(value) => setFormData({ ...formData, producto_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {productos.map((producto) => (
                      <SelectItem key={producto.id} value={producto.id}>
                        {producto.nombre} (Disponible: {producto.cantidad_disponible})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cantidad">Cantidad *</Label>
                <Input
                  id="cantidad"
                  type="number"
                  min="1"
                  required
                  value={formData.cantidad}
                  onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="fecha_movimiento">Fecha *</Label>
                <Input
                  id="fecha_movimiento"
                  type="date"
                  required
                  value={formData.fecha_movimiento}
                  onChange={(e) => setFormData({ ...formData, fecha_movimiento: e.target.value })}
                />
              </div>

              {(formData.tipo_movimiento === "Traslado" || formData.tipo_movimiento === "Devolución") && (
                <>
                  <div>
                    <Label htmlFor="sede_origen">Sede Origen</Label>
                    <Input
                      id="sede_origen"
                      value={formData.sede_origen}
                      onChange={(e) => setFormData({ ...formData, sede_origen: e.target.value })}
                      placeholder="Ej: Almacén Central"
                    />
                  </div>

                  <div>
                    <Label htmlFor="sede_destino">Sede Destino</Label>
                    <Input
                      id="sede_destino"
                      value={formData.sede_destino}
                      onChange={(e) => setFormData({ ...formData, sede_destino: e.target.value })}
                      placeholder="Ej: Sucursal Norte"
                    />
                  </div>
                </>
              )}

              {formData.tipo_movimiento === "Venta" && (
                <div className="col-span-2">
                  <Label htmlFor="precio_venta">Precio de Venta</Label>
                  <Input
                    id="precio_venta"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.precio_venta}
                    onChange={(e) => setFormData({ ...formData, precio_venta: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              )}

              <div className="col-span-2">
                <Label htmlFor="motivo">Motivo / Observaciones</Label>
                <Textarea
                  id="motivo"
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                  placeholder="Describe el motivo del movimiento..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                style={{ backgroundColor: "#487FBB" }}
                className="text-white hover:opacity-90 cursor-pointer"
              >
                {isLoading ? "Registrando..." : "Registrar Movimiento"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

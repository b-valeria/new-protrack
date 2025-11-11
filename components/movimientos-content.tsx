"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus } from "lucide-react"

interface Producto {
  id: string
  nombre: string
  cantidad_disponible: number
  ubicacion: string
}

interface Usuario {
  id: string
  nombre_completo: string
  tipo_usuario: string
}

interface MovimientosContentProps {
  usuario: Usuario
  productos: Producto[]
}

export function MovimientosContent({ usuario, productos }: MovimientosContentProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tipoMovimiento, setTipoMovimiento] = useState("")
  const [formData, setFormData] = useState({
    producto_id: "",
    cantidad: "",
    sede_origen: "",
    sede_destino: "",
    motivo: "",
    precio_venta: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    console.log("[v0] Iniciando registro de movimiento")
    console.log("[v0] Tipo de movimiento:", tipoMovimiento)
    console.log("[v0] Datos del formulario:", formData)
    console.log("[v0] Usuario ID:", usuario.id)

    try {
      const payload = {
        tipo_movimiento: tipoMovimiento,
        producto_id: formData.producto_id,
        cantidad: Number.parseInt(formData.cantidad),
        sede_origen: formData.sede_origen || null,
        sede_destino: formData.sede_destino || null,
        motivo: formData.motivo || null,
        precio_venta: formData.precio_venta ? Number.parseFloat(formData.precio_venta) : null,
        registrado_por: usuario.id,
      }

      console.log("[v0] Payload a enviar:", payload)

      const response = await fetch("/api/movimientos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      console.log("[v0] Status de respuesta:", response.status)

      if (!response.ok) {
        const error = await response.json()
        console.error("[v0] Error del servidor:", error)
        throw new Error(error.error || "Error al registrar movimiento")
      }

      const result = await response.json()
      console.log("[v0] Movimiento registrado exitosamente:", result)

      toast({
        title: "Movimiento registrado",
        description: "El movimiento se ha guardado correctamente",
      })

      // Resetear formulario
      setTipoMovimiento("")
      setFormData({
        producto_id: "",
        cantidad: "",
        sede_origen: "",
        sede_destino: "",
        motivo: "",
        precio_venta: "",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo registrar el movimiento",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const productoSeleccionado = productos.find((p) => p.id === formData.producto_id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: "#0D2646" }}>
          Registro de Movimientos
        </h1>
        <p className="text-muted-foreground">Documenta traslados, devoluciones y pérdidas</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle style={{ color: "#0D2646" }}>Nuevo Movimiento</CardTitle>
          <CardDescription>Completa el formulario para registrar un movimiento de stock</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo de Movimiento */}
            <div className="space-y-2">
              <Label htmlFor="tipo_movimiento">Tipo de Movimiento *</Label>
              <Select value={tipoMovimiento} onValueChange={setTipoMovimiento} required>
                <SelectTrigger id="tipo_movimiento">
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Traslado">Traslado</SelectItem>
                  <SelectItem value="Devolución">Devolución</SelectItem>
                  <SelectItem value="Pérdida">Pérdida</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Producto */}
            <div className="space-y-2">
              <Label htmlFor="producto_id">Producto *</Label>
              <Select
                value={formData.producto_id}
                onValueChange={(value) => setFormData({ ...formData, producto_id: value })}
                required
              >
                <SelectTrigger id="producto_id">
                  <SelectValue placeholder="Selecciona un producto" />
                </SelectTrigger>
                <SelectContent>
                  {productos.map((producto) => (
                    <SelectItem key={producto.id} value={producto.id}>
                      {producto.nombre} (Stock: {producto.cantidad_disponible})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {productoSeleccionado && (
                <p className="text-sm text-muted-foreground">Ubicación actual: {productoSeleccionado.ubicacion}</p>
              )}
            </div>

            {/* Cantidad */}
            <div className="space-y-2">
              <Label htmlFor="cantidad">Cantidad *</Label>
              <Input
                id="cantidad"
                type="number"
                min="1"
                max={productoSeleccionado?.cantidad_disponible || undefined}
                value={formData.cantidad}
                onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                required
                placeholder="Ingresa la cantidad"
              />
              {productoSeleccionado && (
                <p className="text-sm text-muted-foreground">
                  Disponible: {productoSeleccionado.cantidad_disponible} unidades
                </p>
              )}
            </div>

            {/* Sede Origen - Solo para Traslado */}
            {tipoMovimiento === "Traslado" && (
              <div className="space-y-2">
                <Label htmlFor="sede_origen">Sede Origen *</Label>
                <Input
                  id="sede_origen"
                  value={formData.sede_origen}
                  onChange={(e) => setFormData({ ...formData, sede_origen: e.target.value })}
                  required={tipoMovimiento === "Traslado"}
                  placeholder="Ej: Almacén Central"
                />
              </div>
            )}

            {/* Sede Destino - Solo para Traslado */}
            {tipoMovimiento === "Traslado" && (
              <div className="space-y-2">
                <Label htmlFor="sede_destino">Sede Destino *</Label>
                <Input
                  id="sede_destino"
                  value={formData.sede_destino}
                  onChange={(e) => setFormData({ ...formData, sede_destino: e.target.value })}
                  required={tipoMovimiento === "Traslado"}
                  placeholder="Ej: Sucursal Norte"
                />
              </div>
            )}

            {/* Motivo */}
            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo *</Label>
              <Textarea
                id="motivo"
                value={formData.motivo}
                onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                required
                placeholder={
                  tipoMovimiento === "Traslado"
                    ? "Ej: Reubicación de inventario"
                    : tipoMovimiento === "Devolución"
                      ? "Ej: Producto defectuoso"
                      : tipoMovimiento === "Pérdida"
                        ? "Ej: Producto dañado durante almacenamiento"
                        : "Describe el motivo del movimiento"
                }
                rows={3}
              />
            </div>

            {/* Precio de Venta - Opcional para Devolución */}
            {tipoMovimiento === "Devolución" && (
              <div className="space-y-2">
                <Label htmlFor="precio_venta">Precio de Venta (Opcional)</Label>
                <Input
                  id="precio_venta"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precio_venta}
                  onChange={(e) => setFormData({ ...formData, precio_venta: e.target.value })}
                  placeholder="0.00"
                />
                <p className="text-sm text-muted-foreground">Precio al que se vendió originalmente (si aplica)</p>
              </div>
            )}

            {/* Botón Submit */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setTipoMovimiento("")
                  setFormData({
                    producto_id: "",
                    cantidad: "",
                    sede_origen: "",
                    sede_destino: "",
                    motivo: "",
                    precio_venta: "",
                  })
                }}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || !tipoMovimiento} style={{ backgroundColor: "#487FBB" }}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Registrar Movimiento
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"

export function SolicitudForm({ productos, tipo, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    producto_id: "",
    cantidad_solicitada: 0,
    motivo: "",
    organizacion_receptora: "",
    sede_salida: "",
    sede_origen: "",
    sede_destino: "",
  })
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Usuario no autenticado")

      const producto = productos.find((p) => p.id === formData.producto_id)
      if (!producto) throw new Error("Producto no encontrado")

      if (tipo === "Donación") {
        const { error: insertError } = await supabase.from("donaciones").insert({
          nombre_producto: producto.nombre,
          cantidad_donada: Number(formData.cantidad_solicitada),
          sede_salida: formData.sede_salida,
          organizacion_receptora: formData.organizacion_receptora,
          estado: "Pendiente",
          solicitado_por: user.id,
        })

        if (insertError) throw insertError
      } else {
        const solicitudData = {
          tipo_solicitud: tipo,
          producto_id: formData.producto_id,
          nombre_producto: producto.nombre,
          cantidad_solicitada: Number(formData.cantidad_solicitada),
          motivo: formData.motivo,
          solicitado_por: user.id,
          estado: "Pendiente",
        }

        // Si es traslado, agregar información adicional en el motivo
        if (tipo === "Traslado" && formData.sede_origen && formData.sede_destino) {
          solicitudData.motivo = `${formData.motivo}\nOrigen: ${formData.sede_origen}\nDestino: ${formData.sede_destino}`
        }

        const { error: insertError } = await supabase.from("solicitudes").insert(solicitudData)

        if (insertError) throw insertError
      }

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error al crear solicitud")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="producto">Producto *</Label>
        <Select
          value={formData.producto_id}
          onValueChange={(value) => setFormData({ ...formData, producto_id: value })}
        >
          <SelectTrigger className="cursor-pointer">
            <SelectValue placeholder="Seleccionar producto" />
          </SelectTrigger>
          <SelectContent>
            {productos.map((producto) => (
              <SelectItem key={producto.id} value={producto.id} className="cursor-pointer">
                {producto.nombre} - Stock: {producto.cantidad_disponible}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="cantidad">Cantidad Solicitada *</Label>
        <Input
          id="cantidad"
          type="number"
          min="1"
          required
          value={formData.cantidad_solicitada}
          onChange={(e) => setFormData({ ...formData, cantidad_solicitada: Number(e.target.value) })}
        />
      </div>

      {tipo === "Traslado" && (
        <>
          <div>
            <Label htmlFor="sede_origen">Sede de Origen *</Label>
            <Input
              id="sede_origen"
              required
              value={formData.sede_origen}
              onChange={(e) => setFormData({ ...formData, sede_origen: e.target.value })}
              placeholder="Almacén de origen"
            />
          </div>
          <div>
            <Label htmlFor="sede_destino">Sede de Destino *</Label>
            <Input
              id="sede_destino"
              required
              value={formData.sede_destino}
              onChange={(e) => setFormData({ ...formData, sede_destino: e.target.value })}
              placeholder="Almacén de destino"
            />
          </div>
        </>
      )}

      {tipo === "Donación" && (
        <>
          <div>
            <Label htmlFor="organizacion">Organización Receptora *</Label>
            <Input
              id="organizacion"
              required
              value={formData.organizacion_receptora}
              onChange={(e) => setFormData({ ...formData, organizacion_receptora: e.target.value })}
              placeholder="Nombre de la organización"
            />
          </div>
          <div>
            <Label htmlFor="sede">Sede de Salida *</Label>
            <Input
              id="sede"
              required
              value={formData.sede_salida}
              onChange={(e) => setFormData({ ...formData, sede_salida: e.target.value })}
              placeholder="Almacén de origen"
            />
          </div>
        </>
      )}

      <div>
        <Label htmlFor="motivo">Motivo</Label>
        <Textarea
          id="motivo"
          rows={3}
          value={formData.motivo}
          onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
          placeholder="Describe el motivo de la solicitud..."
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="cursor-pointer bg-transparent">
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          disabled={isLoading}
          className="text-white cursor-pointer hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#487FBB" }}
        >
          {isLoading ? "Enviando..." : "Enviar Solicitud"}
        </Button>
      </div>
    </form>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import type { Producto } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface ProductoFormProps {
  producto?: Producto
  onSuccess?: () => void
  onCancel?: () => void
}

export function ProductoForm({ producto, onSuccess, onCancel }: ProductoFormProps) {
  const [formData, setFormData] = useState({
    nombre: producto?.nombre || "",
    tipo: producto?.tipo || "",
    categoria: producto?.categoria || "C",
    proveedor: producto?.proveedor || "",
    ubicacion: producto?.ubicacion || "",
    nro_lotes: producto?.nro_lotes || 0,
    tamanio_lote: producto?.tamanio_lote || 0,
    fecha_entrada: producto?.fecha_entrada || new Date().toISOString().split("T")[0],
    fecha_expiracion: producto?.fecha_expiracion?.split("T")[0] || "",
    cantidad_disponible: producto?.cantidad_disponible || 0,
    umbral_minimo: producto?.umbral_minimo || 0,
    umbral_maximo: producto?.umbral_maximo || 0,
    entrada: producto?.entrada || "Inventario Inicial",
    costo_unitario: producto?.costo_unitario || 0,
    imagen: producto?.imagen || "",
    observaciones: producto?.observaciones || "",
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Usuario no autenticado")

      // Verificar si el nombre ya existe (solo para nuevos productos)
      if (!producto) {
        const { data: existingProduct } = await supabase
          .from("productos")
          .select("nombre")
          .eq("nombre", formData.nombre)
          .single()

        if (existingProduct) {
          setError("Ya existe un producto con este nombre")
          setIsLoading(false)
          return
        }
      }

      const productoData = {
        ...formData,
        nro_lotes: Number(formData.nro_lotes),
        tamanio_lote: Number(formData.tamanio_lote),
        cantidad_disponible: Number(formData.cantidad_disponible),
        umbral_minimo: Number(formData.umbral_minimo),
        umbral_maximo: Number(formData.umbral_maximo),
        costo_unitario: Number(formData.costo_unitario),
        fecha_expiracion: formData.fecha_expiracion || null,
        created_by: user.id,
      }

      if (producto) {
        // Actualizar producto existente
        const { error: updateError } = await supabase.from("productos").update(productoData).eq("id", producto.id)

        if (updateError) throw updateError
      } else {
        // Crear nuevo producto
        const { error: insertError } = await supabase.from("productos").insert(productoData)

        if (insertError) throw insertError
      }

      if (onSuccess) {
        onSuccess()
      } else {
        router.refresh()
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al guardar producto")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="nombre">Nombre del Producto *</Label>
          <Input
            id="nombre"
            required
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            disabled={!!producto}
          />
        </div>

        <div>
          <Label htmlFor="tipo">Tipo *</Label>
          <Input
            id="tipo"
            required
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="categoria">Categoría *</Label>
          <Select
            value={formData.categoria}
            onValueChange={(value) => setFormData({ ...formData, categoria: value as "A" | "B" | "C" })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A">Categoría A</SelectItem>
              <SelectItem value="B">Categoría B</SelectItem>
              <SelectItem value="C">Categoría C</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="proveedor">Proveedor *</Label>
          <Input
            id="proveedor"
            required
            value={formData.proveedor}
            onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="ubicacion">Ubicación *</Label>
          <Input
            id="ubicacion"
            required
            value={formData.ubicacion}
            onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="nro_lotes">Número de Lotes *</Label>
          <Input
            id="nro_lotes"
            type="number"
            min="0"
            required
            value={formData.nro_lotes}
            onChange={(e) => setFormData({ ...formData, nro_lotes: Number(e.target.value) })}
          />
        </div>

        <div>
          <Label htmlFor="tamanio_lote">Tamaño de Lote *</Label>
          <Input
            id="tamanio_lote"
            type="number"
            min="0"
            required
            value={formData.tamanio_lote}
            onChange={(e) => setFormData({ ...formData, tamanio_lote: Number(e.target.value) })}
          />
        </div>

        <div>
          <Label htmlFor="cantidad_disponible">Cantidad Disponible *</Label>
          <Input
            id="cantidad_disponible"
            type="number"
            min="0"
            required
            value={formData.cantidad_disponible}
            onChange={(e) => setFormData({ ...formData, cantidad_disponible: Number(e.target.value) })}
          />
        </div>

        <div>
          <Label htmlFor="umbral_minimo">Umbral Mínimo *</Label>
          <Input
            id="umbral_minimo"
            type="number"
            min="0"
            required
            value={formData.umbral_minimo}
            onChange={(e) => setFormData({ ...formData, umbral_minimo: Number(e.target.value) })}
          />
        </div>

        <div>
          <Label htmlFor="umbral_maximo">Umbral Máximo *</Label>
          <Input
            id="umbral_maximo"
            type="number"
            min="0"
            required
            value={formData.umbral_maximo}
            onChange={(e) => setFormData({ ...formData, umbral_maximo: Number(e.target.value) })}
          />
        </div>

        <div>
          <Label htmlFor="costo_unitario">Costo Unitario *</Label>
          <Input
            id="costo_unitario"
            type="number"
            step="0.01"
            min="0"
            required
            value={formData.costo_unitario}
            onChange={(e) => setFormData({ ...formData, costo_unitario: Number(e.target.value) })}
          />
        </div>

        <div>
          <Label htmlFor="fecha_entrada">Fecha de Entrada *</Label>
          <Input
            id="fecha_entrada"
            type="date"
            required
            value={formData.fecha_entrada}
            onChange={(e) => setFormData({ ...formData, fecha_entrada: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="fecha_expiracion">Fecha de Expiración</Label>
          <Input
            id="fecha_expiracion"
            type="date"
            value={formData.fecha_expiracion}
            onChange={(e) => setFormData({ ...formData, fecha_expiracion: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="entrada">Tipo de Entrada *</Label>
          <Select
            value={formData.entrada}
            onValueChange={(value) =>
              setFormData({ ...formData, entrada: value as "Inventario Inicial" | "Reabastecimiento" })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Inventario Inicial">Inventario Inicial</SelectItem>
              <SelectItem value="Reabastecimiento">Reabastecimiento</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2">
          <Label htmlFor="imagen">URL de Imagen</Label>
          <Input
            id="imagen"
            type="url"
            placeholder="https://ejemplo.com/imagen.jpg"
            value={formData.imagen}
            onChange={(e) => setFormData({ ...formData, imagen: e.target.value })}
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="observaciones">Observaciones</Label>
          <Textarea
            id="observaciones"
            rows={3}
            value={formData.observaciones}
            onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isLoading} style={{ backgroundColor: "#0D2646", color: "#FFFFFF" }}>
          {isLoading ? "Guardando..." : producto ? "Actualizar Producto" : "Crear Producto"}
        </Button>
      </div>
    </form>
  )
}

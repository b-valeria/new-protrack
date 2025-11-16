"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface Producto {
  id: string
  nombre: string
  cantidad_disponible: number
}

interface Usuario {
  id: string
  nombre_completo: string
}

export function FormularioDonaciones({ usuario }: { usuario: Usuario }) {
  const [productos, setProductos] = useState<Producto[]>([])
  const [productoSeleccionado, setProductoSeleccionado] = useState<string>("")
  const [cantidadDonada, setCantidadDonada] = useState<string>("")
  const [sedeSalida, setSedeSalida] = useState<string>("")
  const [organizacionReceptora, setOrganizacionReceptora] = useState<string>("")
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    cargarProductos()
  }, [])

  const cargarProductos = async () => {
    const { data, error } = await supabase
      .from("productos")
      .select("id, nombre, cantidad_disponible")
      .gt("cantidad_disponible", 0)
      .order("nombre")

    if (error) {
      console.error("Error al cargar productos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      })
      return
    }

    setProductos(data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!productoSeleccionado || !cantidadDonada || !sedeSalida || !organizacionReceptora || !fecha) {
      toast({
        title: "Campos incompletos",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      })
      return
    }

    const cantidadNum = parseInt(cantidadDonada)
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      toast({
        title: "Cantidad inválida",
        description: "La cantidad debe ser un número mayor a 0",
        variant: "destructive",
      })
      return
    }

    const producto = productos.find((p) => p.id === productoSeleccionado)
    if (!producto) {
      toast({
        title: "Error",
        description: "Producto no encontrado",
        variant: "destructive",
      })
      return
    }

    if (cantidadNum > producto.cantidad_disponible) {
      toast({
        title: "Cantidad no disponible",
        description: `Solo hay ${producto.cantidad_disponible} unidades disponibles`,
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const { data: donacionData, error: donacionError } = await supabase.from("donaciones").insert({
        producto_id: productoSeleccionado,
        nombre_producto: producto.nombre,
        cantidad_donada: cantidadNum,
        sede_salida: sedeSalida,
        organizacion_receptora: organizacionReceptora,
        fecha: fecha,
        solicitado_por: usuario.id,
        estado: "Pendiente",
      }).select()

      if (donacionError) throw donacionError

      const motivoCompleto = `Donación para ${organizacionReceptora} - Sede: ${sedeSalida}`
      
      const { error: solicitudError } = await supabase.from("solicitudes").insert({
        tipo_solicitud: "Donación",
        nombre_producto: producto.nombre,
        producto_id: productoSeleccionado,
        cantidad_solicitada: cantidadNum,
        motivo: motivoCompleto,
        estado: "Pendiente",
        fecha_solicitud: fecha,
        solicitado_por: usuario.id,
      })

      if (solicitudError) throw solicitudError

      toast({
        title: "Solicitud enviada",
        description: "La solicitud de donación ha sido enviada al Director General",
      })

      // Limpiar formulario
      setProductoSeleccionado("")
      setCantidadDonada("")
      setSedeSalida("")
      setOrganizacionReceptora("")
      setFecha(new Date().toISOString().split('T')[0])
      
      // Recargar productos para actualizar disponibilidad
      await cargarProductos()
    } catch (error) {
      console.error("Error al crear donación:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la solicitud de donación",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nueva Solicitud de Donación</CardTitle>
        <CardDescription>
          Completa el formulario para solicitar una donación de productos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="producto">Producto *</Label>
            <Select value={productoSeleccionado} onValueChange={setProductoSeleccionado}>
              <SelectTrigger id="producto">
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

          <div className="space-y-2">
            <Label htmlFor="cantidad">Cantidad a Donar *</Label>
            <Input
              id="cantidad"
              type="number"
              min="1"
              value={cantidadDonada}
              onChange={(e) => setCantidadDonada(e.target.value)}
              placeholder="Ingresa la cantidad"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sede">Sede de Salida *</Label>
            <Input
              id="sede"
              type="text"
              value={sedeSalida}
              onChange={(e) => setSedeSalida(e.target.value)}
              placeholder="Ingresa la sede de salida"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizacion">Organización Receptora *</Label>
            <Input
              id="organizacion"
              type="text"
              value={organizacionReceptora}
              onChange={(e) => setOrganizacionReceptora(e.target.value)}
              placeholder="Ingresa la organización receptora"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha">Fecha *</Label>
            <Input
              id="fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Enviando..." : "Enviar Solicitud"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

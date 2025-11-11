"use client"

import type { Producto } from "@/lib/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  calcularUnidadesAdquiridas,
  calcularTotalCompra,
  getCategoriaBadgeColor,
  getStockStatus,
  formatCurrency,
  formatDate,
} from "@/lib/utils/productos"
import { Package, MapPin, Calendar, AlertTriangle } from "lucide-react"
import Image from "next/image"

interface ProductoCardProps {
  producto: Producto
  onEdit?: (producto: Producto) => void
  onView?: (producto: Producto) => void
  showActions?: boolean
}

export function ProductoCard({ producto, onEdit, onView, showActions = true }: ProductoCardProps) {
  const unidadesAdquiridas = calcularUnidadesAdquiridas(producto)
  const totalCompra = calcularTotalCompra(producto)
  const stockStatus = getStockStatus(producto)

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full bg-muted">
          {producto.imagen ? (
            <Image src={producto.imagen || "/placeholder.svg"} alt={producto.nombre} fill className="object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge className={getCategoriaBadgeColor(producto.categoria)}>Categoría {producto.categoria}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg text-[#0D2646] line-clamp-1">{producto.nombre}</h3>
          <p className="text-sm text-muted-foreground">{producto.tipo}</p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#487FBB]" />
            <span className="text-muted-foreground">
              {producto.ubicacion} - {producto.proveedor}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-[#487FBB]" />
            <span className={stockStatus.color}>Stock: {producto.cantidad_disponible} unidades</span>
          </div>

          {producto.fecha_expiracion && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#487FBB]" />
              <span className="text-muted-foreground">Vence: {formatDate(producto.fecha_expiracion)}</span>
            </div>
          )}

          {stockStatus.status !== "normal" && (
            <div className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs font-medium">
                {stockStatus.status === "bajo" ? "Stock Bajo" : "Exceso de Stock"}
              </span>
            </div>
          )}
        </div>

        <div className="pt-2 border-t space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Lotes:</span>
            <span className="font-medium">
              {producto.nro_lotes} × {producto.tamanio_lote}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total unidades:</span>
            <span className="font-medium">{unidadesAdquiridas}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Costo unitario:</span>
            <span className="font-medium">{formatCurrency(producto.costo_unitario)}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold">
            <span className="text-[#0D2646]">Total compra:</span>
            <span className="text-[#00BF63]">{formatCurrency(totalCompra)}</span>
          </div>
        </div>
      </CardContent>
      {showActions && (
        <CardFooter className="p-4 pt-0 gap-2">
          {onView && (
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => onView(producto)}>
              Ver Detalles
            </Button>
          )}
          {onEdit && (
            <Button
              className="flex-1"
              style={{ backgroundColor: "#0D2646", color: "#FFFFFF" }}
              onClick={() => onEdit(producto)}
            >
              Editar
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}

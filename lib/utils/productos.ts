import type { Producto } from "@/lib/types"

export function calcularUnidadesAdquiridas(producto: Producto): number {
  return producto.nro_lotes * producto.tamanio_lote
}

export function calcularTotalCompra(producto: Producto): number {
  const unidades = calcularUnidadesAdquiridas(producto)
  return unidades * producto.costo_unitario
}

export function getCategoriaBadgeColor(categoria: "A" | "B" | "C"): string {
  switch (categoria) {
    case "A":
      return "bg-red-100 text-red-800 border-red-300"
    case "B":
      return "bg-yellow-100 text-yellow-800 border-yellow-300"
    case "C":
      return "bg-green-100 text-green-800 border-green-300"
  }
}

export function getStockStatus(producto: Producto): {
  status: "bajo" | "normal" | "exceso"
  color: string
} {
  if (producto.cantidad_disponible <= producto.umbral_minimo) {
    return { status: "bajo", color: "text-red-600" }
  }
  if (producto.cantidad_disponible >= producto.umbral_maximo) {
    return { status: "exceso", color: "text-orange-600" }
  }
  return { status: "normal", color: "text-green-600" }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date))
}

export function formatearMoneda(amount: number): string {
  return formatCurrency(amount)
}

export function formatearFecha(date: string): string {
  return formatDate(date)
}

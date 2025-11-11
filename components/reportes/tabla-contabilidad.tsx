"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface Contabilidad {
  id: string
  nombre_producto: string
  tipo_movimiento: string
  fecha: string
  precio_venta: number
  unidades_vendidas: number
}

interface Movimiento {
  id: string
  tipo_movimiento: string
  cantidad: number
  motivo?: string
  precio_venta?: number
  fecha_movimiento: string
  productos?: { nombre: string }
}

interface TablaContabilidadProps {
  datos: Contabilidad[]
  movimientos?: Movimiento[]
}

export function TablaContabilidad({ datos, movimientos = [] }: TablaContabilidadProps) {
  const devolucionesYPerdidas = movimientos
    .filter((m) => m.tipo_movimiento === "Devolución" || m.tipo_movimiento === "Pérdida")
    .map((m) => ({
      id: m.id,
      nombre_producto: m.productos?.nombre || "Producto",
      tipo_movimiento: m.tipo_movimiento,
      fecha: new Date(m.fecha_movimiento).toLocaleDateString(),
      precio_venta: m.precio_venta || 0,
      unidades_vendidas: m.cantidad,
      motivo: m.motivo,
    }))

  const todosLosMovimientos = [
    ...datos.map((d) => ({
      ...d,
      fecha: new Date(d.fecha).toLocaleDateString(),
      motivo: undefined,
    })),
    ...devolucionesYPerdidas,
  ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

  const totalIngresos = todosLosMovimientos
    .filter((m) => !["Devolución", "Pérdida"].includes(m.tipo_movimiento))
    .reduce((sum, m) => sum + m.precio_venta * m.unidades_vendidas, 0)

  const totalPerdidas = todosLosMovimientos
    .filter((m) => ["Devolución", "Pérdida"].includes(m.tipo_movimiento))
    .reduce((sum, m) => sum + (m.precio_venta || 0) * m.unidades_vendidas, 0)

  const handleExportCSV = () => {
    const headers = ["Producto", "Tipo Movimiento", "Fecha", "Precio Unitario", "Unidades", "Total", "Motivo"]
    const rows = todosLosMovimientos.map((c) => [
      c.nombre_producto,
      c.tipo_movimiento,
      c.fecha,
      c.precio_venta.toFixed(2),
      c.unidades_vendidas,
      (c.precio_venta * c.unidades_vendidas).toFixed(2),
      c.motivo || "",
    ])

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `contabilidad_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle style={{ color: "#0D2646" }}>Contabilidad</CardTitle>
            <CardDescription>Registro de ventas, devoluciones y pérdidas</CardDescription>
          </div>
          <Button onClick={handleExportCSV} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Ingresos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: "#00BF63" }}>
                ${totalIngresos.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Pérdidas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: "#EF4444" }}>
                ${totalPerdidas.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Balance Neto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: "#0D2646" }}>
                ${(totalIngresos - totalPerdidas).toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Precio Unit.</TableHead>
                <TableHead className="text-right">Unidades</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Motivo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {todosLosMovimientos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No hay movimientos contables registrados
                  </TableCell>
                </TableRow>
              ) : (
                todosLosMovimientos.map((movimiento) => (
                  <TableRow key={movimiento.id}>
                    <TableCell className="font-medium">{movimiento.nombre_producto}</TableCell>
                    <TableCell>
                      <span
                        className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
                        style={{
                          backgroundColor:
                            movimiento.tipo_movimiento === "Pérdida"
                              ? "#FFEBEE"
                              : movimiento.tipo_movimiento === "Devolución"
                                ? "#FFF3E0"
                                : "#E8F5E9",
                          color:
                            movimiento.tipo_movimiento === "Pérdida"
                              ? "#C62828"
                              : movimiento.tipo_movimiento === "Devolución"
                                ? "#E65100"
                                : "#2E7D32",
                        }}
                      >
                        {movimiento.tipo_movimiento}
                      </span>
                    </TableCell>
                    <TableCell>{movimiento.fecha}</TableCell>
                    <TableCell className="text-right">${movimiento.precio_venta.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{movimiento.unidades_vendidas}</TableCell>
                    <TableCell className="text-right font-medium">
                      ${(movimiento.precio_venta * movimiento.unidades_vendidas).toFixed(2)}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{movimiento.motivo || "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

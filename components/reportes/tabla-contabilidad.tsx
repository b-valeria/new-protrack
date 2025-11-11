"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download } from "lucide-react"
import { exportarContabilidadExcel, type ReporteContabilidad } from "@/lib/utils/excel-export"
import { formatearFecha, formatearMoneda } from "@/lib/utils/productos"

interface TablaContabilidadProps {
  datos: ReporteContabilidad[]
}

export function TablaContabilidad({ datos }: TablaContabilidadProps) {
  const [mesSeleccionado, setMesSeleccionado] = useState<string>("todos")

  const meses = Array.from(
    new Set(
      datos.map((item) => {
        const fecha = new Date(item.fecha)
        return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`
      }),
    ),
  )
    .sort()
    .reverse()

  const datosFiltrados =
    mesSeleccionado === "todos"
      ? datos
      : datos.filter((item) => {
          const fecha = new Date(item.fecha)
          const mesItem = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`
          return mesItem === mesSeleccionado
        })

  const gananciaTotal = datosFiltrados.reduce((sum, item) => sum + item.ganancia, 0)

  const handleExportar = () => {
    exportarContabilidadExcel(
      datosFiltrados,
      `informe_contabilidad_${mesSeleccionado}_${new Date().toISOString().split("T")[0]}.xlsx`,
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: "#0D2646" }}>
            Informes de Contabilidad
          </h3>
          <p className="text-sm text-muted-foreground">
            Ganancia Total:{" "}
            <span className="font-bold" style={{ color: "#00BF63" }}>
              {formatearMoneda(gananciaTotal)}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={mesSeleccionado} onValueChange={setMesSeleccionado}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar mes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los meses</SelectItem>
              {meses.map((mes) => (
                <SelectItem key={mes} value={mes}>
                  {new Date(mes + "-01").toLocaleDateString("es-ES", { year: "numeric", month: "long" })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleExportar} style={{ backgroundColor: "#00BF63" }}>
            <Download className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow style={{ backgroundColor: "#487FBB" }}>
              <TableHead className="text-white">ID Movimiento</TableHead>
              <TableHead className="text-white">Producto</TableHead>
              <TableHead className="text-white">Tipo</TableHead>
              <TableHead className="text-white">Fecha</TableHead>
              <TableHead className="text-white">Precio Venta</TableHead>
              <TableHead className="text-white">Unidades</TableHead>
              <TableHead className="text-white">Ganancia</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {datosFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No hay movimientos contables para este período
                </TableCell>
              </TableRow>
            ) : (
              datosFiltrados.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-sm">{item.id_movimiento}</TableCell>
                  <TableCell>{item.nombre_producto}</TableCell>
                  <TableCell>{item.tipo_movimiento}</TableCell>
                  <TableCell>{formatearFecha(item.fecha)}</TableCell>
                  <TableCell>{formatearMoneda(item.precio_venta)}</TableCell>
                  <TableCell>{item.unidades_vendidas}</TableCell>
                  <TableCell className="font-semibold" style={{ color: "#00BF63" }}>
                    {formatearMoneda(item.ganancia)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

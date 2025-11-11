"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download } from "lucide-react"
import { exportarTrasladosExcel, type ReporteTraslado } from "@/lib/utils/excel-export"
import { formatearFecha } from "@/lib/utils/productos"

interface TablaTrasladosProps {
  datos: ReporteTraslado[]
}

export function TablaTraslados({ datos }: TablaTrasladosProps) {
  const [mesSeleccionado, setMesSeleccionado] = useState<string>("todos")

  // Obtener meses únicos
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

  // Filtrar datos por mes
  const datosFiltrados =
    mesSeleccionado === "todos"
      ? datos
      : datos.filter((item) => {
          const fecha = new Date(item.fecha)
          const mesItem = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`
          return mesItem === mesSeleccionado
        })

  const handleExportar = () => {
    exportarTrasladosExcel(
      datosFiltrados,
      `informe_traslados_${mesSeleccionado}_${new Date().toISOString().split("T")[0]}.xlsx`,
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <h3 className="text-lg font-semibold" style={{ color: "#0D2646" }}>
          Informes de Traslados
        </h3>
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
              <TableHead className="text-white">ID Traslado</TableHead>
              <TableHead className="text-white">Producto</TableHead>
              <TableHead className="text-white">Origen</TableHead>
              <TableHead className="text-white">Destino</TableHead>
              <TableHead className="text-white">Fecha</TableHead>
              <TableHead className="text-white">Motivo</TableHead>
              <TableHead className="text-white">Encargado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {datosFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No hay traslados registrados para este período
                </TableCell>
              </TableRow>
            ) : (
              datosFiltrados.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-sm">{item.id_traslado}</TableCell>
                  <TableCell>{item.nombre_producto}</TableCell>
                  <TableCell>{item.sede_origen}</TableCell>
                  <TableCell>{item.sede_destino}</TableCell>
                  <TableCell>{formatearFecha(item.fecha)}</TableCell>
                  <TableCell>{item.motivo}</TableCell>
                  <TableCell>{item.encargado}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download } from "lucide-react"
import { exportarInventarioExcel, type ReporteInventario } from "@/lib/utils/excel-export"
import { formatearFecha } from "@/lib/utils/productos"

interface TablaInventarioProps {
  datos: ReporteInventario[]
}

export function TablaInventario({ datos }: TablaInventarioProps) {
  const [mesSeleccionado, setMesSeleccionado] = useState<string>("todos")

  const meses = Array.from(
    new Set(
      datos.map((item) => {
        const fecha = new Date(item.fecha_entrada)
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
          const fecha = new Date(item.fecha_entrada)
          const mesItem = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`
          return mesItem === mesSeleccionado
        })

  // Ordenar por categoría
  const datosOrdenados = [...datosFiltrados].sort((a, b) => {
    const ordenCategoria = { A: 1, B: 2, C: 3 }
    return (
      (ordenCategoria[a.categoria as keyof typeof ordenCategoria] || 4) -
      (ordenCategoria[b.categoria as keyof typeof ordenCategoria] || 4)
    )
  })

  const handleExportar = () => {
    exportarInventarioExcel(
      datosOrdenados,
      `informe_inventario_${mesSeleccionado}_${new Date().toISOString().split("T")[0]}.xlsx`,
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <h3 className="text-lg font-semibold" style={{ color: "#0D2646" }}>
          Informes de Inventario
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
              <TableHead className="text-white">ID Producto</TableHead>
              <TableHead className="text-white">Nombre</TableHead>
              <TableHead className="text-white">Categoría</TableHead>
              <TableHead className="text-white">Nro Lotes</TableHead>
              <TableHead className="text-white">Tamaño Lote</TableHead>
              <TableHead className="text-white">Unidades</TableHead>
              <TableHead className="text-white">Fecha Entrada</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {datosOrdenados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No hay productos en inventario para este período
                </TableCell>
              </TableRow>
            ) : (
              datosOrdenados.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-sm">{item.id_producto}</TableCell>
                  <TableCell>{item.nombre}</TableCell>
                  <TableCell>
                    <span
                      className="px-2 py-1 rounded text-xs font-semibold"
                      style={{
                        backgroundColor:
                          item.categoria === "A" ? "#00BF63" : item.categoria === "B" ? "#487FBB" : "#0D2646",
                        color: "white",
                      }}
                    >
                      {item.categoria}
                    </span>
                  </TableCell>
                  <TableCell>{item.nro_lotes}</TableCell>
                  <TableCell>{item.tamanio_lote}</TableCell>
                  <TableCell>{item.unidades_adquiridas}</TableCell>
                  <TableCell>{formatearFecha(item.fecha_entrada)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

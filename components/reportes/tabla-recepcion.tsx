"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { exportarRecepcionExcel, type ReporteRecepcion } from "@/lib/utils/excel-export"
import { formatearFecha } from "@/lib/utils/productos"

interface TablaRecepcionProps {
  datos: ReporteRecepcion[]
}

export function TablaRecepcion({ datos }: TablaRecepcionProps) {
  const handleExportar = () => {
    exportarRecepcionExcel(datos, `informe_recepcion_${new Date().toISOString().split("T")[0]}.xlsx`)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold" style={{ color: "#0D2646" }}>
          Informes de Recepción
        </h3>
        <Button onClick={handleExportar} style={{ backgroundColor: "#00BF63" }}>
          <Download className="mr-2 h-4 w-4" />
          Exportar Excel
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow style={{ backgroundColor: "#487FBB" }}>
              <TableHead className="text-white">ID Producto</TableHead>
              <TableHead className="text-white">Nombre</TableHead>
              <TableHead className="text-white">Categoría</TableHead>
              <TableHead className="text-white">Proveedor</TableHead>
              <TableHead className="text-white">Ubicación</TableHead>
              <TableHead className="text-white">Nro Lotes</TableHead>
              <TableHead className="text-white">Tamaño Lote</TableHead>
              <TableHead className="text-white">Unidades</TableHead>
              <TableHead className="text-white">Fecha Exp.</TableHead>
              <TableHead className="text-white">Observaciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {datos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground">
                  No hay informes de recepción disponibles
                </TableCell>
              </TableRow>
            ) : (
              datos.map((item, index) => (
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
                  <TableCell>{item.proveedor}</TableCell>
                  <TableCell>{item.ubicacion}</TableCell>
                  <TableCell>{item.nro_lotes}</TableCell>
                  <TableCell>{item.tamanio_lote}</TableCell>
                  <TableCell>{item.unidades_adquiridas}</TableCell>
                  <TableCell>{formatearFecha(item.fecha_expiracion)}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.observaciones}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

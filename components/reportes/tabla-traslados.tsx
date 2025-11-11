"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface Traslado {
  id: string
  nombre_producto: string
  sede_origen: string
  sede_destino: string
  cantidad: number
  fecha: string
  motivo?: string
  estado: string
}

interface Movimiento {
  id: string
  tipo_movimiento: string
  producto_id: string
  cantidad: number
  sede_origen?: string
  sede_destino?: string
  motivo?: string
  fecha_movimiento: string
  productos?: { nombre: string }
}

interface TablaTrasladadosProps {
  datos: Traslado[]
  movimientos?: Movimiento[]
}

export function TablaTraslados({ datos, movimientos = [] }: TablaTrasladadosProps) {
  const trasladosMovimientos = movimientos
    .filter((m) => m.tipo_movimiento === "Traslado")
    .map((m) => ({
      id: m.id,
      nombre_producto: m.productos?.nombre || "Producto",
      sede_origen: m.sede_origen || "N/A",
      sede_destino: m.sede_destino || "N/A",
      cantidad: m.cantidad,
      fecha: new Date(m.fecha_movimiento).toLocaleDateString(),
      motivo: m.motivo,
      estado: "Completado",
    }))

  const todosLosTraslados = [
    ...datos.map((d) => ({
      ...d,
      fecha: new Date(d.fecha).toLocaleDateString(),
    })),
    ...trasladosMovimientos,
  ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

  const handleExportCSV = () => {
    const headers = ["Producto", "Sede Origen", "Sede Destino", "Cantidad", "Fecha", "Estado", "Motivo"]
    const rows = todosLosTraslados.map((t) => [
      t.nombre_producto,
      t.sede_origen,
      t.sede_destino,
      t.cantidad,
      t.fecha,
      t.estado,
      t.motivo || "",
    ])

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `traslados_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle style={{ color: "#0D2646" }}>Traslados</CardTitle>
            <CardDescription>Movimientos de productos entre sedes</CardDescription>
          </div>
          <Button onClick={handleExportCSV} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Sede Origen</TableHead>
                <TableHead>Sede Destino</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Motivo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {todosLosTraslados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No hay traslados registrados
                  </TableCell>
                </TableRow>
              ) : (
                todosLosTraslados.map((traslado) => (
                  <TableRow key={traslado.id}>
                    <TableCell className="font-medium">{traslado.nombre_producto}</TableCell>
                    <TableCell>{traslado.sede_origen}</TableCell>
                    <TableCell>{traslado.sede_destino}</TableCell>
                    <TableCell>{traslado.cantidad}</TableCell>
                    <TableCell>{traslado.fecha}</TableCell>
                    <TableCell>
                      <span
                        className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: traslado.estado === "Completado" ? "#E8F5E9" : "#FFF3E0",
                          color: traslado.estado === "Completado" ? "#2E7D32" : "#E65100",
                        }}
                      >
                        {traslado.estado}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{traslado.motivo || "-"}</TableCell>
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

import * as XLSX from "xlsx"

export interface ReporteRecepcion {
  id_producto: string
  nombre: string
  categoria: string
  proveedor: string
  ubicacion: string
  nro_lotes: number
  tamanio_lote: number
  unidades_adquiridas: number
  fecha_expiracion: string
  observaciones: string
}

export interface ReporteTraslado {
  id_traslado: string
  nombre_producto: string
  sede_origen: string
  sede_destino: string
  fecha: string
  motivo: string
  encargado: string
}

export interface ReporteContabilidad {
  id_movimiento: string
  nombre_producto: string
  tipo_movimiento: string
  fecha: string
  precio_venta: number
  unidades_vendidas: number
  ganancia: number
}

export interface ReporteInventario {
  id_producto: string
  nombre: string
  categoria: string
  nro_lotes: number
  tamanio_lote: number
  unidades_adquiridas: number
  fecha_entrada: string
}

export function exportarRecepcionExcel(datos: ReporteRecepcion[], nombreArchivo = "informe_recepcion.xlsx") {
  const ws = XLSX.utils.json_to_sheet(datos)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Recepción")
  XLSX.writeFile(wb, nombreArchivo)
}

export function exportarTrasladosExcel(datos: ReporteTraslado[], nombreArchivo = "informe_traslados.xlsx") {
  // Agrupar por mes
  const datosPorMes = agruparPorMes(datos, "fecha")

  const wb = XLSX.utils.book_new()

  Object.entries(datosPorMes).forEach(([mes, registros]) => {
    const ws = XLSX.utils.json_to_sheet(registros)
    XLSX.utils.book_append_sheet(wb, ws, mes)
  })

  XLSX.writeFile(wb, nombreArchivo)
}

export function exportarContabilidadExcel(datos: ReporteContabilidad[], nombreArchivo = "informe_contabilidad.xlsx") {
  const datosPorMes = agruparPorMes(datos, "fecha")

  const wb = XLSX.utils.book_new()

  Object.entries(datosPorMes).forEach(([mes, registros]) => {
    const ws = XLSX.utils.json_to_sheet(registros)
    XLSX.utils.book_append_sheet(wb, ws, mes)
  })

  XLSX.writeFile(wb, nombreArchivo)
}

export function exportarInventarioExcel(datos: ReporteInventario[], nombreArchivo = "informe_inventario.xlsx") {
  // Ordenar por categoría (A, B, C) y luego por fecha
  const datosOrdenados = [...datos].sort((a, b) => {
    const ordenCategoria = { A: 1, B: 2, C: 3 }
    const categoriaA = ordenCategoria[a.categoria as keyof typeof ordenCategoria] || 4
    const categoriaB = ordenCategoria[b.categoria as keyof typeof ordenCategoria] || 4

    if (categoriaA !== categoriaB) {
      return categoriaA - categoriaB
    }

    return new Date(a.fecha_entrada).getTime() - new Date(b.fecha_entrada).getTime()
  })

  // Agrupar por mes
  const datosPorMes = agruparPorMes(datosOrdenados, "fecha_entrada")

  const wb = XLSX.utils.book_new()

  Object.entries(datosPorMes).forEach(([mes, registros]) => {
    const ws = XLSX.utils.json_to_sheet(registros)
    XLSX.utils.book_append_sheet(wb, ws, mes)
  })

  XLSX.writeFile(wb, nombreArchivo)
}

function agruparPorMes(datos: any[], campoFecha: string): Record<string, any[]> {
  const grupos: Record<string, any[]> = {}

  datos.forEach((item) => {
    const fecha = new Date(item[campoFecha])
    const mesAnio = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`

    if (!grupos[mesAnio]) {
      grupos[mesAnio] = []
    }

    grupos[mesAnio].push(item)
  })

  return grupos
}

export function importarProductosExcel(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: "binary" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const json = XLSX.utils.sheet_to_json(worksheet)
        resolve(json)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error("Error al leer el archivo"))
    reader.readAsBinaryString(file)
  })
}

export interface Producto {
  id: string
  nombre: string
  tipo: string
  categoria: "A" | "B" | "C"
  proveedor: string
  ubicacion: string
  nro_lotes: number
  tamanio_lote: number
  fecha_entrada: string
  fecha_expiracion?: string
  cantidad_disponible: number
  umbral_minimo: number
  umbral_maximo: number
  entrada: "Inventario Inicial" | "Reabastecimiento"
  costo_unitario: number
  imagen?: string
  observaciones?: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface Usuario {
  id: string
  tipo_usuario: "Director General" | "Administrador" | "Empleado"
  nombre_completo: string
  correo: string
  telefono?: string
  direccion?: string
  cargo: string
  salario_base?: number
  permisos: string[]
  created_at?: string
  updated_at?: string
}

export interface Empresa {
  id: string
  nombre: string
  director_general_id?: string
  empleados: string[]
  categoria_a: string[]
  categoria_b: string[]
  categoria_c: string[]
  almacenes: string[]
  created_at?: string
  updated_at?: string
}

export interface Solicitud {
  id: string
  tipo_solicitud: "Reabastecimiento" | "Traslado"
  producto_id: string
  nombre_producto: string
  cantidad_solicitada: number
  motivo?: string
  estado: "Pendiente" | "Aprobada" | "Rechazada" | "Delegada"
  solicitado_por?: string
  revisado_por?: string
  fecha_solicitud: string
  fecha_revision?: string
  notas_revision?: string
  created_at?: string
  updated_at?: string
}

export interface Alerta {
  id: string
  tipo_alerta: "Stock Bajo" | "Exceso de Stock" | "Producto Próximo a Vencer" | "Reporte Mensual"
  producto_id?: string
  mensaje: string
  leida: boolean
  destinatario_id?: string
  created_at?: string
}

export interface Movimiento {
  id: string
  tipo_movimiento: "Traslado" | "Devolución" | "Pérdida" | "Venta"
  producto_id: string
  cantidad: number
  sede_origen: string | null
  sede_destino: string | null
  motivo: string | null
  precio_venta: number | null
  registrado_por: string
  fecha_movimiento: string
  created_at: string
  updated_at: string
}


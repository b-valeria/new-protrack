// Definición de todos los permisos disponibles en el sistema
export const PERMISOS = {
  // Productos
  EDITAR_PRODUCTOS: "editar_productos",

  // Solicitudes
  APROBAR_SOLICITUDES: "aprobar_solicitudes",

  // Usuarios y Staff
  CREAR_EMPLEADOS: "crear_empleados",
} as const

export type Permiso = (typeof PERMISOS)[keyof typeof PERMISOS]

// Permisos por defecto según el rol
export const PERMISOS_POR_ROL: Record<string, Permiso[]> = {
  "Director General": Object.values(PERMISOS), // Todos los permisos
  Administrador: [PERMISOS.APROBAR_SOLICITUDES, PERMISOS.EDITAR_PRODUCTOS, PERMISOS.CREAR_EMPLEADOS],
  Empleado: [], // Los empleados no tienen estos permisos
}

// Descripciones de permisos para la UI
export const DESCRIPCIONES_PERMISOS: Record<Permiso, string> = {
  [PERMISOS.APROBAR_SOLICITUDES]: "Conceder o negar solicitudes de reabastecimiento de productos",
  [PERMISOS.EDITAR_PRODUCTOS]: "Editar la información de productos existentes en el inventario",
  [PERMISOS.CREAR_EMPLEADOS]: "Crear usuarios empleados en el sistema",
}

// Categorías de permisos para organizar la UI
export const CATEGORIAS_PERMISOS = {
  "Permisos de Administrador": [PERMISOS.APROBAR_SOLICITUDES, PERMISOS.EDITAR_PRODUCTOS, PERMISOS.CREAR_EMPLEADOS],
}

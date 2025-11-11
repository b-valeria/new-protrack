# ABC ProTrack - Sistema de Gestión de Inventario

Sistema completo de gestión de inventario basado en el método ABC para pequeñas empresas.

## Características Principales

### Método ABC
- **Categoría A**: 15-20% de productos, 60-80% del valor total
- **Categoría B**: 30-40% de productos, 10-20% del valor total  
- **Categoría C**: 50-55% de productos, 5-10% del valor total

### Tipos de Usuario

#### 1. Empleado
- Registrar productos
- Rellenar informes de recepción
- Solicitar reabastecimiento
- Solicitar traslados
- Registrar movimientos de stock
- Realizar observaciones sobre lotes

#### 2. Administrador
- Todas las funciones de Empleado
- Aprobar/rechazar solicitudes
- Crear usuarios empleados
- Gestionar staff
- Acceso a informes y reportes
- Crear filtros de búsqueda
- Descargar informes en Excel

#### 3. Director General
- Todas las funciones de Administrador
- Crear usuarios administradores
- Eliminar usuarios
- Editar información de staff
- Mover productos entre categorías
- Subir productos vía Excel
- Configurar alertas del sistema
- Control total del sistema

## Instalación

### Requisitos Previos
- Node.js 18+ instalado
- Cuenta de Supabase configurada

### Pasos de Instalación

1. **Descargar el proyecto**
   - Haz clic en los tres puntos en la esquina superior derecha
   - Selecciona "Download ZIP"
   - Extrae el archivo en tu computadora

2. **Instalar dependencias**
   \`\`\`bash
   cd ABC_Protrack
   npm install
   \`\`\`

3. **Configurar Base de Datos**
   
   Las variables de entorno ya están configuradas en Vercel. Para ejecutar los scripts SQL:
   
   - Ve a tu proyecto en Supabase
   - Abre el SQL Editor
   - Ejecuta los scripts en orden numérico desde la carpeta `scripts/`:
     - `001_create_usuarios_table.sql`
     - `002_create_empresas_table.sql`
     - `003_create_productos_table.sql`
     - Y así sucesivamente...

4. **Ejecutar en desarrollo**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Abrir en el navegador**
   \`\`\`
   http://localhost:3000
   \`\`\`

## Estructura de la Base de Datos

### Tablas Principales

- **usuarios**: Perfiles de usuarios con roles y permisos
- **empresas**: Información de empresas y almacenes
- **productos**: Catálogo completo con categorización ABC
- **contabilidad**: Registro de ventas y movimientos financieros
- **traslados**: Movimientos entre almacenes
- **donaciones**: Registro de donaciones caritativas
- **solicitudes**: Solicitudes de reabastecimiento y traslados
- **alertas**: Sistema de notificaciones automáticas
- **informes_recepcion**: Documentación de recepciones

## Seguridad

- **Row Level Security (RLS)** habilitado en todas las tablas
- Autenticación mediante Supabase Auth
- Validación de contraseñas:
  - Mínimo 8 caracteres
  - Al menos una mayúscula
  - Al menos un número
  - Al menos un signo especial

## Funcionalidades Clave

### Sistema de Alertas
- Stock bajo (cuando se alcanza el umbral mínimo)
- Exceso de stock (cuando se alcanza el umbral máximo)
- Productos próximos a vencer

### Reportes y Exportación
- Informes de recepción
- Informes de traslados (por mes)
- Informes de contabilidad (por mes)
- Informes de inventario (ordenados por categoría ABC)
- Exportación a Excel de todos los informes

### Gestión de Productos
- Registro manual de productos
- Importación masiva vía Excel (solo Director General)
- Búsqueda y filtros dinámicos
- Categorización automática ABC
- Control de stock en tiempo real

## Colores de Marca

- **Azul Primario**: #0D2646
- **Azul Secundario**: #487FBB
- **Verde Acento**: #00BF63
- **Blanco**: #FFFFFF

## Tipografía

- **Fuente Principal**: Inter (Google Fonts)

## Soporte

Para problemas o preguntas, contacta al equipo de desarrollo.

## Licencia

Propiedad de ABC ProTrack. Todos los derechos reservados.

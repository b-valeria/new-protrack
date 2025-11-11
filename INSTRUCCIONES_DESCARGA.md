# Instrucciones para Descargar y Ejecutar ABC ProTrack

## Opción 1: Descargar ZIP desde v0

1. **En la interfaz de v0**:
   - Haz clic en los **tres puntos** (⋮) en la esquina superior derecha del bloque de código
   - Selecciona **"Download ZIP"**
   - Guarda el archivo en tu computadora

2. **Extraer el archivo**:
   - Descomprime el archivo ZIP
   - Abre la carpeta extraída

3. **Abrir en Visual Studio Code**:
   \`\`\`bash
   cd ABC_Protrack
   code .
   \`\`\`

## Opción 2: Usar el CLI de shadcn (Recomendado)

Si tienes el CLI de shadcn instalado, puedes usar:

\`\`\`bash
npx shadcn@latest init
\`\`\`

Y seguir las instrucciones para configurar el proyecto.

## Configuración Inicial

### 1. Instalar Dependencias

\`\`\`bash
npm install
\`\`\`

### 2. Configurar Variables de Entorno

Las variables de Supabase ya están configuradas en Vercel. Si necesitas ejecutar localmente, crea un archivo `.env.local`:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
\`\`\`

### 3. Ejecutar Scripts de Base de Datos

Ve a tu proyecto de Supabase y ejecuta los scripts SQL en orden:

1. `scripts/001_create_usuarios_table.sql`
2. `scripts/002_create_empresas_table.sql`
3. `scripts/003_create_productos_table.sql`
4. `scripts/004_create_contabilidad_table.sql`
5. `scripts/005_create_traslados_table.sql`
6. `scripts/006_create_donaciones_table.sql`
7. `scripts/007_create_solicitudes_table.sql`
8. `scripts/008_create_alertas_table.sql`
9. `scripts/009_create_informes_recepcion_table.sql`
10. `scripts/010_create_trigger_usuario_profile.sql`
11. `scripts/011_create_functions_and_triggers.sql`

### 4. Ejecutar el Servidor de Desarrollo

\`\`\`bash
npm run dev
\`\`\`

### 5. Abrir en el Navegador

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Primer Uso

1. **Registrar Director General**:
   - Ve a la página de registro
   - Completa el formulario con los datos de tu empresa
   - Crea tu cuenta de Director General

2. **Configurar Empresa**:
   - Agrega los almacenes de tu empresa
   - Configura las alertas del sistema

3. **Crear Usuarios**:
   - Crea usuarios Administradores y Empleados
   - Asigna permisos según sea necesario

4. **Comenzar a Usar**:
   - Registra tus primeros productos
   - El sistema automáticamente los categorizará en A, B o C

## Estructura del Proyecto

\`\`\`
ABC_Protrack/
├── app/                    # Páginas de Next.js
│   ├── auth/              # Autenticación
│   ├── dashboard/         # Dashboards por tipo de usuario
│   └── page.tsx           # Página principal
├── components/            # Componentes React
│   ├── layout/           # Layouts
│   ├── reportes/         # Componentes de reportes
│   └── ui/               # Componentes UI (shadcn)
├── lib/                   # Utilidades y configuración
│   ├── supabase/         # Cliente de Supabase
│   └── utils/            # Funciones auxiliares
├── scripts/              # Scripts SQL para la base de datos
└── public/               # Archivos estáticos (logo, etc.)
\`\`\`

## Comandos Útiles

\`\`\`bash
# Desarrollo
npm run dev

# Compilar para producción
npm run build

# Ejecutar en producción
npm start

# Linter
npm run lint
\`\`\`

## Solución de Problemas

### Error: "Module not found"
\`\`\`bash
rm -rf node_modules package-lock.json
npm install
\`\`\`

### Error de conexión a Supabase
- Verifica que las variables de entorno estén correctamente configuradas
- Asegúrate de que los scripts SQL se hayan ejecutado correctamente

### Error de autenticación
- Verifica que la tabla `usuarios` exista en Supabase
- Confirma que el trigger de creación de perfil esté activo

## Despliegue en Vercel

1. Sube tu código a GitHub
2. Conecta tu repositorio en Vercel
3. Las variables de entorno ya están configuradas
4. Despliega automáticamente

## Contacto

Para soporte técnico o consultas, contacta al equipo de desarrollo.

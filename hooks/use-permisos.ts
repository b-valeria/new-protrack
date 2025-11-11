"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import type { Permiso } from "@/lib/permisos"

export function usePermisos() {
  const [permisos, setPermisos] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [tipoUsuario, setTipoUsuario] = useState<string>("")

  useEffect(() => {
    async function fetchPermisos() {
      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: usuario } = await supabase
          .from("usuarios")
          .select("permisos, tipo_usuario")
          .eq("id", user.id)
          .single()

        if (usuario) {
          setTipoUsuario(usuario.tipo_usuario)

          if (usuario.tipo_usuario === "Director General") {
            setPermisos(["aprobar_solicitudes", "editar_productos", "crear_empleados"])
          } else {
            let parsedPermisos: string[] = []
            if (typeof usuario.permisos === "string") {
              try {
                parsedPermisos = JSON.parse(usuario.permisos)
              } catch {
                parsedPermisos = []
              }
            } else if (Array.isArray(usuario.permisos)) {
              parsedPermisos = usuario.permisos
            }
            setPermisos(parsedPermisos)
          }
        }
      }
      setIsLoading(false)
    }

    fetchPermisos()
  }, [])

  const tienePermiso = (permiso: Permiso): boolean => {
    // Director General siempre tiene todos los permisos
    if (tipoUsuario === "Director General") return true
    return permisos.includes(permiso)
  }

  const tieneAlgunPermiso = (permisosRequeridos: Permiso[]): boolean => {
    if (tipoUsuario === "Director General") return true
    return permisosRequeridos.some((p) => permisos.includes(p))
  }

  const tieneTodosPermisos = (permisosRequeridos: Permiso[]): boolean => {
    if (tipoUsuario === "Director General") return true
    return permisosRequeridos.every((p) => permisos.includes(p))
  }

  return {
    permisos,
    tipoUsuario,
    isLoading,
    tienePermiso,
    tieneAlgunPermiso,
    tieneTodosPermisos,
  }
}

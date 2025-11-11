"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import type { Permiso } from "@/lib/permisos"

export function usePermisos() {
  const [permisos, setPermisos] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchPermisos() {
      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: usuario } = await supabase.from("usuarios").select("permisos").eq("id", user.id).single()

        if (usuario) {
          setPermisos(usuario.permisos || [])
        }
      }
      setIsLoading(false)
    }

    fetchPermisos()
  }, [])

  const tienePermiso = (permiso: Permiso): boolean => {
    return permisos.includes(permiso)
  }

  const tieneAlgunPermiso = (permisosRequeridos: Permiso[]): boolean => {
    return permisosRequeridos.some((p) => permisos.includes(p))
  }

  const tieneTodosPermisos = (permisosRequeridos: Permiso[]): boolean => {
    return permisosRequeridos.every((p) => permisos.includes(p))
  }

  return {
    permisos,
    isLoading,
    tienePermiso,
    tieneAlgunPermiso,
    tieneTodosPermisos,
  }
}

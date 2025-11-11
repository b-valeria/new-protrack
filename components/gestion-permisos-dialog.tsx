"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import type { Usuario } from "@/lib/types"
import { DESCRIPCIONES_PERMISOS, PERMISOS, type Permiso } from "@/lib/permisos"
import { updateUsuarioPermisos } from "@/app/actions/usuarios"
import { Badge } from "@/components/ui/badge"

interface GestionPermisosDialogProps {
  usuario: Usuario
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function GestionPermisosDialog({ usuario, open, onOpenChange, onSuccess }: GestionPermisosDialogProps) {
  const [permisos, setPermisos] = useState<string[]>(usuario.permisos || [])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  if (usuario.tipo_usuario !== "Administrador") {
    return null
  }

  const handleTogglePermiso = (permiso: Permiso) => {
    setPermisos((prev) => (prev.includes(permiso) ? prev.filter((p) => p !== permiso) : [...prev, permiso]))
  }

  const handleGuardar = async () => {
    setIsLoading(true)
    try {
      await updateUsuarioPermisos(usuario.id, permisos)
      toast({
        title: "Permisos actualizados",
        description: "Los permisos del usuario se han actualizado correctamente",
      })
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron actualizar los permisos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gestionar Permisos - {usuario.nombre_completo}</DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{usuario.tipo_usuario}</Badge>
            <Badge variant="secondary">{permisos.length} de 3 permisos activos</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Selecciona los permisos que deseas conceder a este administrador:
          </p>

          <div className="space-y-4">
            {Object.values(PERMISOS).map((permiso) => (
              <div
                key={permiso}
                className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <Checkbox
                  id={permiso}
                  checked={permisos.includes(permiso)}
                  onCheckedChange={() => handleTogglePermiso(permiso)}
                  className="mt-1 cursor-pointer"
                />
                <div className="flex-1">
                  <Label htmlFor={permiso} className="text-sm font-medium leading-none cursor-pointer">
                    {DESCRIPCIONES_PERMISOS[permiso]}
                  </Label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading} className="cursor-pointer">
            Cancelar
          </Button>
          <Button
            onClick={handleGuardar}
            disabled={isLoading}
            className="cursor-pointer hover:opacity-90"
            style={{ backgroundColor: "#487FBB", color: "#FFFFFF" }}
          >
            {isLoading ? "Guardando..." : "Guardar Permisos"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Mail, Phone, MapPin, Briefcase, Trash2, Edit, Shield, ChevronDown } from "lucide-react"
import type { Usuario } from "@/lib/types"
import { validatePassword, isPasswordValid } from "@/lib/password-validation"
import { PasswordRequirementsDisplay } from "@/components/password-requirements"
import { updateUsuarioPermisos, updateUsuario } from "@/app/actions/usuarios"
import { useToast } from "@/hooks/use-toast"

export function StaffManagementDirector() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [showDialog, setShowDialog] = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const [formData, setFormData] = useState({
    tipo_usuario: "Empleado" as "Empleado" | "Administrador",
    nombre_completo: "",
    correo: "",
    telefono: "",
    direccion: "",
    cargo: "",
    salario_base: 0,
    password: "",
  })
  const [passwordRequirements, setPasswordRequirements] = useState(validatePassword(""))
  const [error, setError] = useState<string | null>(null)

  const [editingPermisos, setEditingPermisos] = useState<{ [key: string]: boolean }>({})
  const [permisosTemp, setPermisosTemp] = useState<{ [key: string]: string[] }>({})

  const [editFormData, setEditFormData] = useState({
    nombre_completo: "",
    telefono: "",
    direccion: "",
    cargo: "",
    salario_base: 0,
  })
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const supabase = createBrowserClient()
    setIsLoading(true)

    try {
      const { data: usuariosData } = await supabase
        .from("usuarios")
        .select("*")
        .neq("tipo_usuario", "Director General")
        .order("created_at", { ascending: false })

      setUsuarios(usuariosData || [])
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = (password: string) => {
    setFormData({ ...formData, password })
    setPasswordRequirements(validatePassword(password))
  }

  const handleCreateUsuario = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createBrowserClient()
    setIsCreating(true)
    setError(null)

    if (!isPasswordValid(passwordRequirements)) {
      setError("La contraseña no cumple con todos los requisitos")
      setIsCreating(false)
      return
    }

    try {
      const { data: existingUser } = await supabase
        .from("usuarios")
        .select("correo")
        .eq("correo", formData.correo)
        .single()

      if (existingUser) {
        setError("Este correo ya está registrado en el sistema")
        setIsCreating(false)
        return
      }

      const permisos =
        formData.tipo_usuario === "Administrador" ? ["aprobar_solicitudes", "editar_productos", "crear_empleados"] : []

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.correo,
        password: formData.password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            tipo_usuario: formData.tipo_usuario,
            nombre_completo: formData.nombre_completo,
            telefono: formData.telefono,
            direccion: formData.direccion,
            cargo: formData.cargo,
            salario_base: formData.salario_base,
            permisos: JSON.stringify(permisos),
          },
        },
      })

      if (authError) throw authError

      setShowDialog(false)
      setFormData({
        tipo_usuario: "Empleado",
        nombre_completo: "",
        correo: "",
        telefono: "",
        direccion: "",
        cargo: "",
        salario_base: 0,
        password: "",
      })
      loadData()
      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente",
      })
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al crear usuario")
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteUsuario = async (usuarioId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este usuario?")) return

    const supabase = createBrowserClient()
    try {
      const { error } = await supabase.from("usuarios").delete().eq("id", usuarioId)

      if (error) throw error
      loadData()
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado exitosamente",
      })
    } catch (error) {
      console.error("Error deleting usuario:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario",
        variant: "destructive",
      })
    }
  }

  const handlePermisoChange = (usuarioId: string, permiso: string, checked: boolean) => {
    setPermisosTemp((prev) => {
      const currentPermisos = prev[usuarioId] || usuarios.find((u) => u.id === usuarioId)?.permisos || []
      const newPermisos = checked ? [...currentPermisos, permiso] : currentPermisos.filter((p) => p !== permiso)
      return { ...prev, [usuarioId]: newPermisos }
    })
  }

  const handleSavePermisos = async (usuarioId: string) => {
    const newPermisos = permisosTemp[usuarioId]
    if (!newPermisos) return

    try {
      await updateUsuarioPermisos(usuarioId, newPermisos)
      setEditingPermisos((prev) => ({ ...prev, [usuarioId]: false }))
      setPermisosTemp((prev) => {
        const updated = { ...prev }
        delete updated[usuarioId]
        return updated
      })
      loadData()
      toast({
        title: "Permisos actualizados",
        description: "Los permisos han sido actualizados exitosamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron actualizar los permisos",
        variant: "destructive",
      })
    }
  }

  const handleEditUsuario = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUsuario) return

    setIsUpdating(true)
    try {
      await updateUsuario(selectedUsuario.id, editFormData)
      setSelectedUsuario(null)
      loadData()
      toast({
        title: "Usuario actualizado",
        description: "La información del usuario ha sido actualizada exitosamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el usuario",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const empleados = usuarios.filter((u) => u.tipo_usuario === "Empleado")
  const administradores = usuarios.filter((u) => u.tipo_usuario === "Administrador")

  const UserCard = ({ u }: { u: Usuario }) => {
    const isExpanded = expandedCard === u.id
    const isEditingPermiso = editingPermisos[u.id]

    let currentPermisos: string[] = []
    try {
      if (permisosTemp[u.id]) {
        currentPermisos = permisosTemp[u.id]
      } else if (u.permisos) {
        if (typeof u.permisos === "string") {
          currentPermisos = JSON.parse(u.permisos)
        } else if (Array.isArray(u.permisos)) {
          currentPermisos = u.permisos
        }
      } else {
        currentPermisos = []
      }
    } catch (error) {
      currentPermisos = []
    }

    const handleCardClick = (e: React.MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest("button") || target.closest('input[type="checkbox"]') || target.closest("label")) {
        return
      }
      setExpandedCard(isExpanded ? null : u.id)
    }

    return (
      <Card key={u.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleCardClick}>
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center gap-3">
            <Avatar className="h-20 w-20">
              <AvatarFallback style={{ backgroundColor: "#487FBB", color: "#FFFFFF" }}>
                {getInitials(u.nombre_completo)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{u.nombre_completo}</h3>
              <Badge variant="outline" className="mt-1">
                {u.tipo_usuario}
              </Badge>
            </div>

            {!isExpanded && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Mail className="h-4 w-4" />
                <span className="truncate">{u.correo}</span>
              </div>
            )}

            {!isExpanded && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Briefcase className="h-4 w-4" />
                <span>{u.cargo}</span>
              </div>
            )}

            {/* Indicador de expansión */}
            {!isExpanded && (
              <div className="flex items-center justify-center text-xs text-muted-foreground">
                <ChevronDown className="h-4 w-4" />
                <span>Ver detalles</span>
              </div>
            )}
          </div>

          {isExpanded && (
            <div className="mt-6 space-y-4 border-t pt-4">
              <h4 className="font-semibold text-lg mb-4">Detalles del Usuario</h4>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{u.correo}</span>
                </div>
                {u.telefono && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{u.telefono}</span>
                  </div>
                )}
                {u.direccion && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{u.direccion}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>{u.cargo}</span>
                </div>
                {u.salario_base && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Salario:</span>
                    <span className="font-medium">${u.salario_base.toLocaleString("es-ES")}</span>
                  </div>
                )}
              </div>

              {u.tipo_usuario === "Administrador" && (
                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-5 w-5" style={{ color: "#487FBB" }} />
                    <span className="font-semibold" style={{ color: "#487FBB" }}>
                      Sección de Permisos
                    </span>
                  </div>

                  <div className="space-y-3 pl-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`${u.id}-aprobar`}
                        checked={currentPermisos.includes("aprobar_solicitudes")}
                        onCheckedChange={(checked) =>
                          handlePermisoChange(u.id, "aprobar_solicitudes", checked as boolean)
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                      <label
                        htmlFor={`${u.id}-aprobar`}
                        className="text-sm leading-none cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Conceder/Negar Solicitudes de Reabastecimiento
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`${u.id}-editar`}
                        checked={currentPermisos.includes("editar_productos")}
                        onCheckedChange={(checked) => handlePermisoChange(u.id, "editar_productos", checked as boolean)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <label
                        htmlFor={`${u.id}-editar`}
                        className="text-sm leading-none cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Editar Productos Existentes
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`${u.id}-crear`}
                        checked={currentPermisos.includes("crear_empleados")}
                        onCheckedChange={(checked) => handlePermisoChange(u.id, "crear_empleados", checked as boolean)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <label
                        htmlFor={`${u.id}-crear`}
                        className="text-sm leading-none cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Crear Usuarios Empleados
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditFormData({
                      nombre_completo: u.nombre_completo,
                      telefono: u.telefono || "",
                      direccion: u.direccion || "",
                      cargo: u.cargo,
                      salario_base: u.salario_base || 0,
                    })
                    setSelectedUsuario(u)
                  }}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteUsuario(u.id)
                  }}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "#0D2646" }}>
            Gestión de Personal
          </h1>
          <p className="text-muted-foreground">Control completo de usuarios del sistema</p>
        </div>
        <Button
          onClick={() => setShowDialog(true)}
          style={{ backgroundColor: "#487FBB", color: "#FFFFFF" }}
          className="cursor-pointer hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Crear Usuario
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usuarios.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{administradores.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empleados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{empleados.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="todos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="todos" className="cursor-pointer">
            Todos
          </TabsTrigger>
          <TabsTrigger value="administradores" className="cursor-pointer">
            Administradores
          </TabsTrigger>
          <TabsTrigger value="empleados" className="cursor-pointer">
            Empleados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {usuarios.map((u) => (
              <UserCard key={u.id} u={u} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="administradores" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {administradores.map((u) => (
              <UserCard key={u.id} u={u} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="empleados" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {empleados.map((u) => (
              <UserCard key={u.id} u={u} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            <DialogDescription>Completa la información para crear un nuevo usuario</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUsuario} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="tipo_usuario">Tipo de Usuario *</Label>
                <Select
                  value={formData.tipo_usuario}
                  onValueChange={(value) =>
                    setFormData({ ...formData, tipo_usuario: value as "Empleado" | "Administrador" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Empleado">Empleado</SelectItem>
                    <SelectItem value="Administrador">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Label htmlFor="nombre_completo">Nombre Completo *</Label>
                <Input
                  id="nombre_completo"
                  required
                  value={formData.nombre_completo}
                  onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="correo">Correo Electrónico *</Label>
                <Input
                  id="correo"
                  type="email"
                  required
                  value={formData.correo}
                  onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="cargo">Cargo *</Label>
                <Input
                  id="cargo"
                  required
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="salario_base">Salario Base</Label>
                <Input
                  id="salario_base"
                  type="number"
                  step="0.01"
                  value={formData.salario_base}
                  onChange={(e) => setFormData({ ...formData, salario_base: Number(e.target.value) })}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="password">Contraseña Provisional *</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                />
              </div>

              <div className="col-span-2">
                <PasswordRequirementsDisplay requirements={passwordRequirements} />
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)} className="cursor-pointer">
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                style={{ backgroundColor: "#487FBB", color: "#FFFFFF" }}
                className="cursor-pointer hover:opacity-90"
              >
                {isCreating ? "Creando..." : "Crear Usuario"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedUsuario} onOpenChange={() => setSelectedUsuario(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>Actualiza la información del usuario</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditUsuario} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="edit_nombre">Nombre Completo *</Label>
                <Input
                  id="edit_nombre"
                  required
                  value={editFormData.nombre_completo}
                  onChange={(e) => setEditFormData({ ...editFormData, nombre_completo: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit_telefono">Teléfono</Label>
                <Input
                  id="edit_telefono"
                  type="tel"
                  value={editFormData.telefono}
                  onChange={(e) => setEditFormData({ ...editFormData, telefono: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit_cargo">Cargo *</Label>
                <Input
                  id="edit_cargo"
                  required
                  value={editFormData.cargo}
                  onChange={(e) => setEditFormData({ ...editFormData, cargo: e.target.value })}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="edit_direccion">Dirección</Label>
                <Input
                  id="edit_direccion"
                  value={editFormData.direccion}
                  onChange={(e) => setEditFormData({ ...editFormData, direccion: e.target.value })}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="edit_salario">Salario Base</Label>
                <Input
                  id="edit_salario"
                  type="number"
                  step="0.01"
                  value={editFormData.salario_base}
                  onChange={(e) => setEditFormData({ ...editFormData, salario_base: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedUsuario(null)}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                style={{ backgroundColor: "#487FBB", color: "#FFFFFF" }}
                className="cursor-pointer hover:opacity-90"
              >
                {isUpdating ? "Actualizando..." : "Actualizar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

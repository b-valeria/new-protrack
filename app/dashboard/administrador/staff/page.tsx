"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Mail, Phone, MapPin, Briefcase } from "lucide-react"
import type { Usuario } from "@/lib/types"
import { validatePassword, isPasswordValid } from "@/lib/password-validation"
import { PasswordRequirementsDisplay } from "@/components/password-requirements"

export default function AdministradorStaffPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [empleados, setEmpleados] = useState<Usuario[]>([])
  const [showDialog, setShowDialog] = useState(false)
  const [selectedEmpleado, setSelectedEmpleado] = useState<Usuario | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    nombre_completo: "",
    correo: "",
    telefono: "",
    direccion: "",
    cargo: "",
    password: "",
  })
  const [passwordRequirements, setPasswordRequirements] = useState(validatePassword(""))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data: usuarioData } = await supabase.from("usuarios").select("*").eq("id", user.id).single()

      if (!usuarioData || usuarioData.tipo_usuario !== "Administrador") {
        router.push("/dashboard")
        return
      }

      setUsuario(usuarioData)

      const { data: empleadosData } = await supabase
        .from("usuarios")
        .select("*")
        .eq("tipo_usuario", "Empleado")
        .order("created_at", { ascending: false })

      setEmpleados(empleadosData || [])
    } catch (error) {
      console.error("[v0] Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = (password: string) => {
    setFormData({ ...formData, password })
    setPasswordRequirements(validatePassword(password))
  }

  const handleCreateEmpleado = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsCreating(true)
    setError(null)

    if (!isPasswordValid(passwordRequirements)) {
      setError("La contraseña no cumple con todos los requisitos")
      setIsCreating(false)
      return
    }

    try {
      // Verificar si el correo ya existe
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

      // Crear usuario en auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.correo,
        password: formData.password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            tipo_usuario: "Empleado",
            nombre_completo: formData.nombre_completo,
            telefono: formData.telefono,
            direccion: formData.direccion,
            cargo: formData.cargo,
            salario_base: 0,
            permisos: JSON.stringify([]),
          },
        },
      })

      if (authError) throw authError

      setShowDialog(false)
      setFormData({
        nombre_completo: "",
        correo: "",
        telefono: "",
        direccion: "",
        cargo: "",
        password: "",
      })
      loadData()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al crear empleado")
    } finally {
      setIsCreating(false)
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

  if (!usuario) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "#0D2646" }}>
            Gestión de Personal
          </h1>
          <p className="text-muted-foreground">Administra los empleados del sistema</p>
        </div>
        <Button onClick={() => setShowDialog(true)} style={{ backgroundColor: "#00BF63", color: "#FFFFFF" }}>
          <Plus className="h-4 w-4 mr-2" />
          Crear Empleado
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Empleados Activos</CardTitle>
          <CardDescription>
            {empleados.length} {empleados.length === 1 ? "empleado" : "empleados"} en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {empleados.map((empleado) => (
              <Card
                key={empleado.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedEmpleado(empleado)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback style={{ backgroundColor: "#487FBB", color: "#FFFFFF" }}>
                        {getInitials(empleado.nombre_completo)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{empleado.nombre_completo}</h3>
                      <Badge variant="outline" className="mt-1">
                        {empleado.cargo}
                      </Badge>
                      <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{empleado.correo}</span>
                        </div>
                        {empleado.telefono && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{empleado.telefono}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog para crear empleado */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Empleado</DialogTitle>
            <DialogDescription>Completa la información para crear un nuevo usuario empleado</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateEmpleado} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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

              <div className="col-span-2">
                <Label htmlFor="cargo">Cargo *</Label>
                <Input
                  id="cargo"
                  required
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
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
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreating} style={{ backgroundColor: "#0D2646", color: "#FFFFFF" }}>
                {isCreating ? "Creando..." : "Crear Empleado"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para ver detalles del empleado */}
      <Dialog open={!!selectedEmpleado} onOpenChange={() => setSelectedEmpleado(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles del Empleado</DialogTitle>
          </DialogHeader>
          {selectedEmpleado && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback style={{ backgroundColor: "#487FBB", color: "#FFFFFF" }}>
                    {getInitials(selectedEmpleado.nombre_completo)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedEmpleado.nombre_completo}</h3>
                  <Badge variant="outline">{selectedEmpleado.cargo}</Badge>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedEmpleado.correo}</span>
                </div>
                {selectedEmpleado.telefono && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedEmpleado.telefono}</span>
                  </div>
                )}
                {selectedEmpleado.direccion && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedEmpleado.direccion}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>Tipo: {selectedEmpleado.tipo_usuario}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

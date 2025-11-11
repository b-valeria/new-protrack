"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PasswordRequirements } from "@/components/password-requirements"
import { validatePassword } from "@/lib/password-validation"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

interface CrearUsuarioFormProps {
  tipoUsuarioCreador: "Director General" | "Administrador"
  empresaId: string
  onSuccess?: () => void
}

export function CrearUsuarioForm({ tipoUsuarioCreador, empresaId, onSuccess }: CrearUsuarioFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    nombre_completo: "",
    correo: "",
    telefono: "",
    direccion: "",
    cargo: "",
    salario_base: "",
    tipo_usuario: "Empleado" as "Empleado" | "Administrador",
    contrasenia: "",
  })
  const [passwordValidation, setPasswordValidation] = useState(validatePassword(""))

  const handlePasswordChange = (password: string) => {
    setFormData({ ...formData, contrasenia: password })
    setPasswordValidation(validatePassword(password))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    if (!passwordValidation.isValid) {
      setError("La contraseña no cumple con los requisitos mínimos")
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()

      // Verificar si el correo ya existe
      const { data: existingUser } = await supabase
        .from("usuarios")
        .select("correo")
        .eq("correo", formData.correo)
        .single()

      if (existingUser) {
        setError("Ya existe un usuario con este correo electrónico")
        setLoading(false)
        return
      }

      // Crear usuario en auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.correo,
        password: formData.contrasenia,
        options: {
          data: {
            nombre_completo: formData.nombre_completo,
            tipo_usuario: formData.tipo_usuario,
          },
        },
      })

      if (authError) throw authError

      if (authData.user) {
        // Crear perfil de usuario
        const { error: profileError } = await supabase.from("usuarios").insert({
          id: authData.user.id,
          tipo_usuario: formData.tipo_usuario,
          nombre_completo: formData.nombre_completo,
          correo: formData.correo,
          telefono: formData.telefono,
          direccion: formData.direccion,
          cargo: formData.cargo,
          salario_base: Number.parseFloat(formData.salario_base),
          empresa_id: empresaId,
          permisos:
            formData.tipo_usuario === "Administrador"
              ? ["gestionar_solicitudes", "editar_productos", "crear_empleados", "crear_filtros"]
              : [],
        })

        if (profileError) throw profileError

        setSuccess(true)
        setFormData({
          nombre_completo: "",
          correo: "",
          telefono: "",
          direccion: "",
          cargo: "",
          salario_base: "",
          tipo_usuario: "Empleado",
          contrasenia: "",
        })

        if (onSuccess) onSuccess()
      }
    } catch (err: any) {
      setError(err.message || "Error al crear el usuario")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear Nuevo Usuario</CardTitle>
        <CardDescription>
          {tipoUsuarioCreador === "Director General"
            ? "Crea usuarios Empleado o Administrador"
            : "Crea usuarios Empleado"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre_completo">Nombre Completo</Label>
              <Input
                id="nombre_completo"
                value={formData.nombre_completo}
                onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="correo">Correo Electrónico</Label>
              <Input
                id="correo"
                type="email"
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cargo">Cargo</Label>
              <Input
                id="cargo"
                value={formData.cargo}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salario_base">Salario Base</Label>
              <Input
                id="salario_base"
                type="number"
                step="0.01"
                value={formData.salario_base}
                onChange={(e) => setFormData({ ...formData, salario_base: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_usuario">Tipo de Usuario</Label>
              <Select
                value={formData.tipo_usuario}
                onValueChange={(value: "Empleado" | "Administrador") =>
                  setFormData({ ...formData, tipo_usuario: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Empleado">Empleado</SelectItem>
                  {tipoUsuarioCreador === "Director General" && (
                    <SelectItem value="Administrador">Administrador</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contrasenia">Contraseña Provisional</Label>
            <Input
              id="contrasenia"
              type="password"
              value={formData.contrasenia}
              onChange={(e) => handlePasswordChange(e.target.value)}
              required
            />
            <PasswordRequirements validation={passwordValidation} />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200">
              <p className="text-sm text-green-600">
                Usuario creado exitosamente. Se ha enviado un correo con las credenciales.
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !passwordValidation.isValid}
            className="w-full"
            style={{ backgroundColor: "#487FBB" }}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando usuario...
              </>
            ) : (
              "Crear Usuario"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Image from "next/image"
import { validatePassword, isPasswordValid } from "@/lib/password-validation"
import { PasswordRequirementsDisplay } from "@/components/password-requirements"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nombreCompleto: "",
    correo: "",
    telefono: "",
    direccion: "",
    nombreEmpresa: "",
    password: "",
    confirmPassword: "",
  })
  const [passwordRequirements, setPasswordRequirements] = useState(validatePassword(""))
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handlePasswordChange = (password: string) => {
    setFormData({ ...formData, password })
    setPasswordRequirements(validatePassword(password))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    // Validar contraseña
    if (!isPasswordValid(passwordRequirements)) {
      setError("La contraseña no cumple con todos los requisitos")
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      setIsLoading(false)
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
        setIsLoading(false)
        return
      }

      // Crear usuario en auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.correo,
        password: formData.password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            tipo_usuario: "Director General",
            nombre_completo: formData.nombreCompleto,
            telefono: formData.telefono,
            direccion: formData.direccion,
            cargo: "Director General",
            salario_base: 0,
            permisos: JSON.stringify([
              "Registrar Productos",
              "Consultar Informes",
              "Aprobar Solicitudes",
              "Crear Usuarios",
              "Eliminar Usuarios",
              "Editar Staff",
              "Crear Filtros",
              "Mover Categorías",
              "Descargar Informes",
              "Subir Excel",
              "Configurar Alertas",
            ]),
          },
        },
      })

      if (authError) throw authError

      // Crear empresa
      if (authData.user) {
        const { error: empresaError } = await supabase.from("empresas").insert({
          nombre: formData.nombreEmpresa,
          director_general_id: authData.user.id,
          empleados: JSON.stringify([]),
          almacenes: JSON.stringify(["Almacén Principal"]),
        })

        if (empresaError) throw empresaError
      }

      router.push("/auth/registro-exitoso")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al registrar")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="w-full max-w-2xl">
        <div className="flex flex-col gap-6">
          <div className="flex justify-center mb-4">
            <Image src="/img/logo.png" alt="ProTrack Logo" width={200} height={80} priority />
          </div>
          <Card style={{ borderColor: "#487FBB" }}>
            <CardHeader>
              <CardTitle className="text-2xl" style={{ color: "#0D2646" }}>
                Registrar Empresa
              </CardTitle>
              <CardDescription>Crea tu cuenta de Director General para comenzar</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="nombreEmpresa">Nombre de la Empresa</Label>
                    <Input
                      id="nombreEmpresa"
                      type="text"
                      required
                      value={formData.nombreEmpresa}
                      onChange={(e) => setFormData({ ...formData, nombreEmpresa: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="nombreCompleto">Nombre Completo</Label>
                      <Input
                        id="nombreCompleto"
                        type="text"
                        required
                        value={formData.nombreCompleto}
                        onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input
                        id="telefono"
                        type="tel"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="correo">Correo Electrónico</Label>
                    <Input
                      id="correo"
                      type="email"
                      placeholder="correo@ejemplo.com"
                      required
                      value={formData.correo}
                      onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="direccion">Dirección</Label>
                    <Input
                      id="direccion"
                      type="text"
                      value={formData.direccion}
                      onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                    />
                  </div>
                  <PasswordRequirementsDisplay requirements={passwordRequirements} />
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                    style={{ backgroundColor: "#0D2646", color: "#FFFFFF" }}
                  >
                    {isLoading ? "Registrando..." : "Registrar Empresa"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  ¿Ya tienes una cuenta?{" "}
                  <Link href="/auth/login" className="underline underline-offset-4" style={{ color: "#487FBB" }}>
                    Iniciar sesión
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

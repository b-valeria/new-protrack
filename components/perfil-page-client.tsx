"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { User, Mail, Phone, MapPin, Briefcase, DollarSign, Upload } from 'lucide-react'
import type { Usuario } from "@/lib/types"

interface PerfilPageClientProps {
  usuario: Usuario
}

export function PerfilPageClient({ usuario: initialUsuario }: PerfilPageClientProps) {
  const [usuario, setUsuario] = useState(initialUsuario)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    nombre_completo: usuario.nombre_completo,
    correo: usuario.correo,
    telefono: usuario.telefono || "",
    direccion: usuario.direccion || "",
    cargo: usuario.cargo,
    salario_base: usuario.salario_base || 0,
  })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const router = useRouter()

  const canEditSalaryAndPosition = usuario.tipo_usuario === "Director General"

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      console.log("[v0] Iniciando guardado de perfil")
      let photoUrl = null

      // Upload photo if selected
      if (photoFile) {
        console.log("[v0] Subiendo foto:", photoFile.name)
        const formData = new FormData()
        formData.append("file", photoFile)

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        console.log("[v0] Upload response status:", uploadResponse.status)

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          console.error("[v0] Error en upload:", errorData)
          throw new Error("Error al subir la foto")
        }

        const uploadData = await uploadResponse.json()
        photoUrl = uploadData.url
        console.log("[v0] Foto subida exitosamente:", photoUrl)
      }

      // Update user profile
      const updateData: any = {
        nombre_completo: formData.nombre_completo,
        correo_electronico: formData.correo,
        telefono: formData.telefono,
        direccion: formData.direccion,
      }

      // Only Director General can update cargo and salario
      if (canEditSalaryAndPosition) {
        updateData.cargo = formData.cargo
        updateData.salario_base = formData.salario_base
      }

      if (photoUrl) {
        updateData.foto_perfil = photoUrl
      }

      console.log("[v0] Enviando datos al servidor:", updateData)

      const response = await fetch("/api/perfil", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      console.log("[v0] Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("[v0] Error del servidor:", errorData)
        throw new Error(errorData.error || "Error al actualizar el perfil")
      }

      const updatedUsuario = await response.json()
      console.log("[v0] Perfil actualizado exitosamente:", updatedUsuario)
      
      setIsEditing(false)
      setPhotoFile(null)
      setPhotoPreview(null)
      toast.success("Perfil actualizado correctamente")
      
      console.log("[v0] Recargando página en 1 segundo para actualizar sidebar...")
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error("[v0] Error updating profile:", error)
      toast.error(error instanceof Error ? error.message : "Error al actualizar el perfil")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      nombre_completo: usuario.nombre_completo,
      correo: usuario.correo,
      telefono: usuario.telefono || "",
      direccion: usuario.direccion || "",
      cargo: usuario.cargo,
      salario_base: usuario.salario_base || 0,
    })
    setIsEditing(false)
    setPhotoFile(null)
    setPhotoPreview(null)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: "#0D2646" }}>
          Mi Perfil
        </h1>
        <p className="text-muted-foreground">Ver y editar tu información personal</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>
                {canEditSalaryAndPosition
                  ? "Puedes editar toda tu información"
                  : "No puedes editar tu cargo ni salario"}
              </CardDescription>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} style={{ backgroundColor: "#487FBB", color: "#FFFFFF" }}>
                Editar Perfil
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  style={{ backgroundColor: "#00BF63", color: "#FFFFFF" }}
                >
                  {isSaving ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Photo Section */}
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={photoPreview || usuario.foto_perfil || undefined} />
              <AvatarFallback style={{ backgroundColor: "#487FBB", color: "#FFFFFF" }}>
                {getInitials(usuario.nombre_completo)}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <div>
                <Label htmlFor="photo-upload" className="cursor-pointer">
                  <div
                    className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted transition-colors"
                    style={{ borderColor: "#487FBB" }}
                  >
                    <Upload className="h-4 w-4" />
                    <span>Subir Foto</span>
                  </div>
                  <Input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </Label>
                {photoFile && <p className="text-sm text-muted-foreground mt-2">Foto seleccionada: {photoFile.name}</p>}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre Completo */}
            <div className="space-y-2">
              <Label htmlFor="nombre_completo" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nombre Completo
              </Label>
              {isEditing ? (
                <Input
                  id="nombre_completo"
                  value={formData.nombre_completo}
                  onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                />
              ) : (
                <p className="text-lg">{usuario.nombre_completo}</p>
              )}
            </div>

            {/* Correo */}
            <div className="space-y-2">
              <Label htmlFor="correo" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Correo Electrónico
              </Label>
              {isEditing ? (
                <Input
                  id="correo"
                  type="email"
                  value={formData.correo}
                  onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                />
              ) : (
                <p className="text-lg">{usuario.correo}</p>
              )}
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="telefono" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Teléfono
              </Label>
              {isEditing ? (
                <Input
                  id="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="Ingresa tu teléfono"
                />
              ) : (
                <p className="text-lg">{usuario.telefono || "No especificado"}</p>
              )}
            </div>

            {/* Dirección */}
            <div className="space-y-2">
              <Label htmlFor="direccion" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Dirección
              </Label>
              {isEditing ? (
                <Input
                  id="direccion"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  placeholder="Ingresa tu dirección"
                />
              ) : (
                <p className="text-lg">{usuario.direccion || "No especificada"}</p>
              )}
            </div>

            {/* Cargo */}
            <div className="space-y-2">
              <Label htmlFor="cargo" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Cargo
              </Label>
              {isEditing && canEditSalaryAndPosition ? (
                <Input
                  id="cargo"
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                />
              ) : (
                <p className="text-lg">{usuario.cargo}</p>
              )}
              {isEditing && !canEditSalaryAndPosition && (
                <p className="text-sm text-muted-foreground">Solo el Director General puede editar este campo</p>
              )}
            </div>

            {/* Salario */}
            <div className="space-y-2">
              <Label htmlFor="salario_base" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Salario Base
              </Label>
              {isEditing && canEditSalaryAndPosition ? (
                <Input
                  id="salario_base"
                  type="number"
                  value={formData.salario_base}
                  onChange={(e) => setFormData({ ...formData, salario_base: Number(e.target.value) })}
                />
              ) : (
                <p className="text-lg">${usuario.salario_base?.toLocaleString() || "No especificado"}</p>
              )}
              {isEditing && !canEditSalaryAndPosition && (
                <p className="text-sm text-muted-foreground">Solo el Director General puede editar este campo</p>
              )}
            </div>
          </div>

          {/* User Type Badge */}
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Tipo de Usuario:</span>
              <span
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor:
                    usuario.tipo_usuario === "Director General"
                      ? "#0D2646"
                      : usuario.tipo_usuario === "Administrador"
                        ? "#487FBB"
                        : "#00BF63",
                  color: "#FFFFFF",
                }}
              >
                {usuario.tipo_usuario}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

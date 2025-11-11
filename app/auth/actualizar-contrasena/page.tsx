"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Image from "next/image"
import { validatePassword, isPasswordValid } from "@/lib/password-validation"
import { PasswordRequirementsDisplay } from "@/components/password-requirements"

export default function ActualizarContrasenaPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordRequirements, setPasswordRequirements] = useState(validatePassword(""))
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handlePasswordChange = (newPassword: string) => {
    setPassword(newPassword)
    setPasswordRequirements(validatePassword(newPassword))
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (!isPasswordValid(passwordRequirements)) {
      setError("La contraseña no cumple con todos los requisitos")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })
      if (error) throw error
      router.push("/auth/login")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al actualizar contraseña")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <div className="flex justify-center mb-4">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ProTrack%20%282%29-qNP5e3cY5a2HBRoKZJMJpT1G7lqqVb.png"
              alt="ProTrack Logo"
              width={200}
              height={80}
              priority
            />
          </div>
          <Card style={{ borderColor: "#487FBB" }}>
            <CardHeader>
              <CardTitle className="text-2xl" style={{ color: "#0D2646" }}>
                Nueva Contraseña
              </CardTitle>
              <CardDescription>Ingresa tu nueva contraseña</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="password">Nueva Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
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
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                    style={{ backgroundColor: "#0D2646", color: "#FFFFFF" }}
                  >
                    {isLoading ? "Actualizando..." : "Actualizar Contraseña"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

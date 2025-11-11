"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import Image from "next/image"

export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/actualizar-contrasena`,
      })
      if (error) throw error
      setSuccess(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al enviar correo")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <div className="flex justify-center mb-4">
            <Image src="/img/logo.png" alt="ProTrack Logo" width={200} height={80} priority />
          </div>
          <Card style={{ borderColor: "#487FBB" }}>
            <CardHeader>
              <CardTitle className="text-2xl" style={{ color: "#0D2646" }}>
                Recuperar Contraseña
              </CardTitle>
              <CardDescription>Ingresa tu correo para recibir instrucciones</CardDescription>
            </CardHeader>
            <CardContent>
              {success ? (
                <div className="space-y-4">
                  <p className="text-sm" style={{ color: "#00BF63" }}>
                    Se ha enviado un correo con instrucciones para restablecer tu contraseña.
                  </p>
                  <Button asChild className="w-full" style={{ backgroundColor: "#0D2646", color: "#FFFFFF" }}>
                    <Link href="/auth/login">Volver a Iniciar Sesión</Link>
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword}>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Correo Electrónico</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="correo@ejemplo.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                      style={{ backgroundColor: "#0D2646", color: "#FFFFFF" }}
                    >
                      {isLoading ? "Enviando..." : "Enviar Instrucciones"}
                    </Button>
                  </div>
                  <div className="mt-4 text-center text-sm">
                    <Link href="/auth/login" className="underline underline-offset-4" style={{ color: "#487FBB" }}>
                      Volver a Iniciar Sesión
                    </Link>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

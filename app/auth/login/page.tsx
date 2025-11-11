"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error

      // Guardar credenciales si "recordar" está activado
      if (rememberMe) {
        localStorage.setItem("remembered_email", email)
      } else {
        localStorage.removeItem("remembered_email")
      }

      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="w-full bg-[#0D2646] px-6 py-4">
        <div className="flex items-center gap-3">
          <Image src="/img/logo.png" alt="ProTrack Logo" width={40} height={40} priority />
          <span className="text-white text-xl font-bold">PROTRACK</span>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">
          <Card style={{ borderColor: "#487FBB" }}>
            <CardHeader>
              <CardTitle className="text-2xl" style={{ color: "#0D2646" }}>
                Iniciar Sesión
              </CardTitle>
              <CardDescription>Ingresa tus credenciales para acceder a ProTrack</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
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
                  <div className="grid gap-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      />
                      <Label htmlFor="remember" className="text-sm cursor-pointer">
                        Recordar credenciales
                      </Label>
                    </div>
                    <Link
                      href="/auth/recuperar-contrasena"
                      className="text-sm underline underline-offset-4"
                      style={{ color: "#487FBB" }}
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                    style={{ backgroundColor: "#0D2646", color: "#FFFFFF" }}
                  >
                    {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  ¿No tienes una cuenta?{" "}
                  <Link href="/auth/register" className="underline underline-offset-4" style={{ color: "#487FBB" }}>
                    Registrar empresa
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

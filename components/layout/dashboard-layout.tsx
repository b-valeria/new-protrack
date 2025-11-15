"use client"

import { type ReactNode, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, LogOut, Menu, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { Usuario } from "@/lib/types"

interface DashboardLayoutProps {
  children: ReactNode
  usuario: Usuario
  navigation: Array<{
    name: string
    href: string
    icon: ReactNode
  }>
}

export function DashboardLayout({ children, usuario, navigation }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const supabase = createClient()

      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("[v0] Error during signOut:", error)
      }

      // Limpiar cualquier dato almacenado localmente
      localStorage.clear()
      sessionStorage.clear()

      // Usar hard redirect para asegurar que se limpie todo el estado
      window.location.href = "/"
    } catch (error) {
      console.error("[v0] Error during logout:", error)
      window.location.href = "/"
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30 w-64 bg-[#0D2646]
          transform transition-transform duration-200 ease-in-out lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          flex flex-col
        `}
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Image src="/img/logo.png" alt="ProTrack" width={40} height={40} priority />
            <span className="text-white text-xl font-bold">PROTRACK</span>
          </div>
        </div>

        <div className="p-6 border-b border-white/10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1" />
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex flex-col items-center text-center gap-3">
            <Avatar className="h-20 w-20">
              <AvatarImage src={usuario.foto_perfil || undefined} alt={usuario.nombre} />
              <AvatarFallback style={{ backgroundColor: "#487FBB", color: "#FFFFFF", fontSize: "1.5rem" }}>
                {getInitials(usuario.nombre_completo)}
              </AvatarFallback>
            </Avatar>
            <div>
              <Link href="/dashboard/perfil" className="text-white font-semibold text-lg hover:underline">
                {usuario.nombre_completo}
              </Link>
              <p className="text-white/70 text-sm">{usuario.tipo_usuario}</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <div className="text-white [&>svg]:stroke-white">{item.icon}</div>
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="px-4 pb-4">
          <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar Sesión</span>
          </Button>
        </div>
      </aside>

      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-40 bg-white shadow-md"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="flex-1 p-6 lg:ml-0">{children}</main>
    </div>
  )
}

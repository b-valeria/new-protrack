import Link from "next/link"
import Image from "next/image"
import { Instagram, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#487FBB] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-4">
          <Image src="/img/logo.png" alt="ProTrack Logo" width={60} height={60} />
          <h1 className="text-white text-5xl font-bold tracking-tight">PROTRACK</h1>
        </div>
        <div className="flex gap-4">
          <Button
            asChild
            variant="secondary"
            size="lg"
            className="bg-white text-[#0D2646] hover:bg-gray-100 px-8 py-6 text-lg font-semibold rounded-xl cursor-pointer"
          >
            <Link href="/auth/login">Iniciar Sesión</Link>
          </Button>
          <Button
            asChild
            variant="secondary"
            size="lg"
            className="bg-white text-[#0D2646] hover:bg-gray-100 px-8 py-6 text-lg font-semibold rounded-xl"
          >
            <Link href="/auth/register">Registrarse</Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-between px-8 py-12 gap-12">
        {/* Left Side - Hero Text */}
        <div className="flex-1 max-w-2xl">
          <h2 className="text-white text-7xl font-bold leading-tight">
            Organiza,
            <br />
            optimiza y
            <br />
            domina tu stock
          </h2>
        </div>

        {/* Right Side - App Mockup */}
        <div className="flex-1 flex justify-end">
          <Image
            src="/img/mockup.jpg"
            alt="ProTrack App Preview"
            width={700}
            height={500}
            className="rounded-lg shadow-2xl"
            priority
          />
        </div>
      </main>

      {/* Footer - Social Media Icons */}
      <footer className="flex justify-end gap-6 px-8 py-8">
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <Instagram className="w-7 h-7 text-[#0D2646]" />
        </a>
        <a
          href="https://discord.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <MessageCircle className="w-7 h-7 text-[#0D2646]" />
        </a>
        <a
          href="https://tiktok.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <svg className="w-7 h-7 text-[#0D2646]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
          </svg>
        </a>
        <a
          href="https://x.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <svg className="w-7 h-7 text-[#0D2646]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
      </footer>
    </div>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

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
                Lo sentimos, algo salió mal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {params?.error ? (
                <p className="text-sm text-muted-foreground">Código de error: {params.error}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Ocurrió un error no especificado.</p>
              )}
              <Button asChild className="w-full" style={{ backgroundColor: "#0D2646", color: "#FFFFFF" }}>
                <Link href="/auth/login">Volver a Iniciar Sesión</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

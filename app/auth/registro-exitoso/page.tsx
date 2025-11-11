import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export default function RegistroExitosoPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <div className="flex justify-center mb-4">
            <Image src="/img/logo.png" alt="ProTrack Logo" width={200} height={80} priority />
          </div>
          <Card style={{ borderColor: "#00BF63" }}>
            <CardHeader>
              <CardTitle className="text-2xl" style={{ color: "#0D2646" }}>
                ¡Registro Exitoso!
              </CardTitle>
              <CardDescription>Verifica tu correo electrónico</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Te hemos enviado un correo de confirmación. Por favor, revisa tu bandeja de entrada y haz clic en el
                enlace de verificación para activar tu cuenta.
              </p>
              <p className="text-sm text-muted-foreground">
                Una vez verificado tu correo, podrás iniciar sesión en ProTrack.
              </p>
              <Button asChild className="w-full" style={{ backgroundColor: "#0D2646", color: "#FFFFFF" }}>
                <Link href="/auth/login">Ir a Iniciar Sesión</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

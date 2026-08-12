import { CircleDollarSign } from "lucide-react"
import Image from "next/image"

import { GoogleSignInButton } from "@/components/action-buttons/google-sign-in-button"

export default async function LOginPage() {
  return (
    <section className="flex h-screen">
      <div className="flex w-full max-w-2xl flex-col items-center justify-center p-4">
        <span className="fixed top-4 left-4 flex items-center gap-1 font-bold">
          Órbita
        </span>

        <CircleDollarSign className="mb-4 size-10 text-primary dark:text-green-600" />
        <h1 className="text-2xl font-bold text-foreground">
          Bem-vindo de volta
        </h1>
        <p className="text-muted-foreground">Acesse sua conta para continuar</p>
        <div className="mt-4 flex w-full max-w-md items-center justify-center">
          <GoogleSignInButton />
        </div>
      </div>
      <div className="relative flex-1">
        <Image
          src="/images/space-orbit.jpg"
          alt="Imagem de um planeta no espaço"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
    </section>
  )
}

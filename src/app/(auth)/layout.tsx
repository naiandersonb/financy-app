import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { createClient } from "@/lib/supabase/server"
import { CircleDollarSign, Moon, Sun } from "lucide-react"
import { redirect } from "next/navigation"
import { ReactNode } from "react"

type LayoutProps = {
  children: ReactNode
}

export default async function DashboardRootLayout({ children }: LayoutProps) {
  const supabase = await createClient()

  const {
    data,
    error,
  } = await supabase.auth.getClaims()

  const claims = data?.claims

  if (error || !claims?.sub) {
    redirect("/login")
  }

  const metadata = claims.user_metadata ?? {}
  const name = (metadata.full_name ?? metadata.name ?? "Usuário") as string
  const email = (claims.email ?? "") as string
  const avatarUrl = metadata.avatar_url as string | undefined
  const initials = name.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950">
      <header className="flex flex-row items-center justify-between border-b border-border bg-neutral-50 p-4 dark:bg-neutral-950">
        <span className="flex items-center gap-1 font-bold">
          <CircleDollarSign className="size-6 text-primary dark:text-green-600" />
          Órbita
        </span>

        <div className="flex items-center gap-4">
          <ToggleGroup
            defaultValue={["light"]}
            className="gap-0 border border-border p-1"
            size="sm"
          >
            <ToggleGroupItem value="light">
              <Sun />
            </ToggleGroupItem>
            <ToggleGroupItem value="dark">
              <Moon />
            </ToggleGroupItem>
          </ToggleGroup>

          <div className="flex items-center gap-2">
            <Avatar>
              {avatarUrl ? <AvatarImage src={avatarUrl} /> : null}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="text-xs">
              <p className="font-bold text-foreground">{name}</p>
              <p className="text-muted-foreground">{email}</p>
            </div>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { CircleDollarSign, Moon, Sun } from "lucide-react"
import { ReactNode } from "react"

type LayoutProps = {
  children: ReactNode
}

export default function DashboardRootLayout({ children }: LayoutProps) {
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
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="text-xs">
              <p className="font-bold text-foreground">Naianderson Bruno</p>
              <p className="text-muted-foreground">naianderson@gmail.com</p>
            </div>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}

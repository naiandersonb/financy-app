"use client"

import { MoonIcon, SunDimIcon } from "lucide-react"
import { useTheme } from "next-themes"

const emptySubscribe = () => () => {}

import { Button } from "@/components/ui/button"
import { useSyncExternalStore } from "react"

export const ToggleThemeButton = () => {
  const { resolvedTheme, setTheme } = useTheme()

  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  if (!mounted) return null

  return (
    <Button size="icon" variant="ghost" onClick={toggleTheme}>
      {resolvedTheme === "dark" ? <SunDimIcon /> : <MoonIcon />}
    </Button>
  )
}

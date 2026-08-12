"use client"

import { MoonIcon, SunDimIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export const ToggleThemeButton = () => {
  const { resolvedTheme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  return (
    <Button size="icon" variant="ghost" onClick={toggleTheme}>
      {resolvedTheme === "dark" ? <SunDimIcon /> : <MoonIcon />}
    </Button>
  )
}

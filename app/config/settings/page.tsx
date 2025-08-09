// app/config/settings/page.tsx
"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Moon, Sun } from "lucide-react"

import { PasswordResetForm } from "@/components/password-reset-form"
import { AddEmailForm } from "@/components/add-email-form"
import { useEffect, useState } from "react"
import type { UserSession } from "@/lib/auth"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<UserSession | null>(null)

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data && data.userId) setUser(data)
        else setUser(null)
      })
      .catch(() => setUser(null))
  }, [])

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Ajustes generales</h1>
        <p className="text-muted-foreground">Personaliza tu experiencia en la aplicación.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Seguridad</CardTitle>
            <CardDescription>Cambia tu contraseña de acceso.</CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordResetForm />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Correo electrónico</CardTitle>
            <CardDescription>
              Tu correo electrónico es importante para la recuperación de cuenta y notificaciones.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddEmailForm user={user} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Apariencia</CardTitle>
            <CardDescription>Elige cómo quieres que se vea la aplicación.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="font-medium">Tema</p>
              <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}> 
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Cambiar tema</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

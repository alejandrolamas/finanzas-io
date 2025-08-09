// components/signup-form.tsx
"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

export function SignupForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast({ variant: "destructive", title: "Error", description: "Las contraseñas no coinciden." })
      return
    }
    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email }),
      })

      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error || "Error al crear la cuenta.")
      }

      toast({ title: "¡Cuenta creada!", description: "Bienvenido a Finanzas.io. Serás redirigido." })
      router.push("/")
      router.refresh()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ocurrió un error"
      toast({ variant: "destructive", title: "Error en el registro", description: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear Cuenta</CardTitle>
        <CardDescription>Regístrate para empezar a gestionar tus finanzas.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username-signup">Nombre de Usuario</Label>
            <Input
              id="username-signup"
              type="text"
              placeholder="Tu nombre de usuario"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="email-signup">Email</Label>
            <Input
              id="email-signup"
              type="email"
              placeholder="Tu email"
              required
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-signup">Contraseña</Label>
            <Input
              id="password-signup"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword-signup">Confirmar Contraseña</Label>
            <Input
              id="confirmPassword-signup"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creando cuenta..." : "Crear Cuenta y Entrar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

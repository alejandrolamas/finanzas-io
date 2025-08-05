"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

export function PasswordResetForm() {
  const { toast } = useToast()
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "Error", description: "Las nuevas contraseñas no coinciden." })
      return
    }
    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      })

      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error || "Error al cambiar la contraseña.")
      }

      toast({ title: "¡Contraseña actualizada!", description: "Tu contraseña ha sido cambiada con éxito." })
      // Limpiar los campos
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ocurrió un error"
      toast({ variant: "destructive", title: "Error", description: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleReset} className="space-y-4 max-w-sm">
      <div className="space-y-2">
        <Label htmlFor="oldPassword">Contraseña Actual</Label>
        <Input
          id="oldPassword"
          type="password"
          required
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="newPassword">Nueva Contraseña</Label>
        <Input
          id="newPassword"
          type="password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword-reset">Confirmar Nueva Contraseña</Label>
        <Input
          id="confirmPassword-reset"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Actualizando..." : "Cambiar Contraseña"}
      </Button>
    </form>
  )
}

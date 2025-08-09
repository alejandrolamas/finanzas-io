"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { UserSession } from "@/lib/auth"


export function AddEmailForm( { user }: { user: UserSession | null } ) {
    const { toast } = useToast()
    const [newEmail, setNewEmail] = useState("")
    const [confirmEmail, setConfirmEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [currentEmail, setCurrentEmail] = useState(user?.email || null)

    // Mantener sincronizado el email si cambia el prop user
    useEffect(() => {
      setCurrentEmail(user?.email || null)
    }, [user?.email])


    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newEmail !== confirmEmail) {
          toast({ variant: "destructive", title: "Error", description: "Los correos electrónicos no coinciden." })
          return
        }
        setIsLoading(true)

        try {
          const res = await fetch("/api/auth/set-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body:  newEmail ? JSON.stringify({ email: newEmail }) : "{}",
          })

          if (!res.ok) {
            const { error } = await res.json()
            throw new Error(error || "Error al cambiar la contraseña.")
          }

          // Refrescar el email actual desde la sesión
          const sessionRes = await fetch("/api/auth/session")
          if (sessionRes.ok) {
            const sessionData = await sessionRes.json()
            setCurrentEmail(sessionData.email || null)
          }

          toast({ title: "¡Contraseña actualizada!", description: "Tu correo ha sido añadido con éxito." })
          setNewEmail("")
          setConfirmEmail("")
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Ocurrió un error"
          toast({ variant: "destructive", title: "Error", description: errorMessage })
        } finally {
          setIsLoading(false)
        }
    }

  return (
    <form onSubmit={handleReset} className="space-y-4 max-w-sm">
      {currentEmail && (
        <div className="space-y-2">
          <Label>Correo electrónico actual</Label>
          <Input type="text" value={currentEmail} readOnly tabIndex={-1} className="bg-muted cursor-default" />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="newEmail">Nuevo correo electrónico</Label>
        <Input
          id="newEmail"
          type="email"
          required
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="Introduce tu correo"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmEmail-reset">Confirmar nuevo correo electrónico</Label>
        <Input
          id="confirmEmail-reset"
          type="email"
          required
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
          placeholder="Repite tu correo"
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Actualizando..." : (currentEmail ? "Actualizar correo" : "Añadir correo")}
      </Button>
    </form>
  )
}

// app/login/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Wallet } from "lucide-react"
import { SetupForm } from "@/components/setup-form"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  const [isSetupComplete, setIsSetupComplete] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkSetupStatus() {
      try {
        const res = await fetch("/api/auth/status")
        const data = await res.json()
        setIsSetupComplete(data.isSetupComplete)
      } catch (error) {
        console.error("Failed to check setup status", error)
        // Asumir que el setup está completo para evitar un bloqueo en caso de error
        setIsSetupComplete(true)
      } finally {
        setLoading(false)
      }
    }
    checkSetupStatus()
  }, [])

  const handleSetupSuccess = () => {
    setIsSetupComplete(true)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center items-center gap-2 mb-4">
          <Wallet className="w-8 h-8 text-accent" />
          <h1 className="text-2xl font-bold">Finanzas.io</h1>
        </div>
        {loading ? (
          <p className="text-center text-muted-foreground">Cargando...</p>
        ) : isSetupComplete === false ? (
          <SetupForm onSuccess={handleSetupSuccess} />
        ) : (
          <LoginForm />
        )}
      </div>
    </div>
  )
}

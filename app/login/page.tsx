// app/login/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Wallet } from "lucide-react"
import { SetupForm } from "@/components/setup-form"
import { LoginForm } from "@/components/login-form"
import { SignupForm } from "@/components/signup-form" // Importar nuevo componente
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const [isSetupComplete, setIsSetupComplete] = useState<boolean | null>(null)
  const [formToShow, setFormToShow] = useState<"login" | "signup">("login")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkSetupStatus() {
      try {
        const res = await fetch("/api/auth/status")
        const data = await res.json()
        setIsSetupComplete(data.isSetupComplete)
      } catch (error) {
        console.error("Failed to check setup status", error)
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

  const renderForm = () => {
    if (loading) {
      return <p className="text-center text-muted-foreground">Cargando...</p>
    }
    if (isSetupComplete === false) {
      return <SetupForm onSuccess={handleSetupSuccess} />
    }
    if (formToShow === "login") {
      return (
        <>
          <LoginForm />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Button variant="link" className="p-0 h-auto" onClick={() => setFormToShow("signup")}>
              Regístrate
            </Button>
          </p>
        </>
      )
    }
    return (
      <>
        <SignupForm />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Button variant="link" className="p-0 h-auto" onClick={() => setFormToShow("login")}>
            Inicia sesión
          </Button>
        </p>
      </>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center items-center gap-2 mb-4">
          <Wallet className="w-8 h-8 text-accent" />
          <h1 className="text-2xl font-bold">Finanzas.io</h1>
        </div>
        {renderForm()}
      </div>
    </div>
  )
}

"use client"

import { useEffect } from "react"

export default function BalanceRefresher() {
  useEffect(() => {
    // Ejecuta el recálculo en segundo plano, sin bloquear la UI
    fetch("/api/accounts/recalculate-balances", { method: "POST" }).catch(() => {
      // Silenciar errores; no es crítico bloquear la carga
    })
  }, [])
  return null
}

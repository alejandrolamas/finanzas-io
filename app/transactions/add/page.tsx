"use client"

import { Suspense } from "react"
import { AddTransactionContent } from "@/components/add-transaction-content"

export default function AddTransactionPage() {
  return (
    <Suspense fallback={<div className="text-center text-muted-foreground">Cargando...</div>}>
      <AddTransactionContent />
    </Suspense>
  )
}

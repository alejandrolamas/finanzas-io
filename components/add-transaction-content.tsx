"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { TransactionForm } from "@/components/transaction-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getTransaction } from "@/app/actions/transactions"
import type { ITransaction } from "@/models/Transaction"

export function AddTransactionContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const transactionId = searchParams.get("id")

  const [transaction, setTransaction] = useState<ITransaction | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (transactionId) {
      setLoading(true)
      getTransaction(transactionId)
        .then((data) => {
          if (data) {
            setTransaction(data)
          }
          setLoading(false)
        })
        .catch(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [transactionId])

  const handleSuccess = () => {
    router.push("/transactions")
    router.refresh()
  }

  if (loading && transactionId) {
    return <div className="text-center">Cargando transacción...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{transactionId ? "Editar Transacción" : "Nueva Transacción"}</CardTitle>
        <p className="text-muted-foreground">
          {transactionId ? "Modifica los detalles de la transacción." : "Añade un nuevo ingreso o gasto."}
        </p>
      </CardHeader>
      <CardContent>
        <TransactionForm onSuccess={handleSuccess} transaction={transaction} />
      </CardContent>
    </Card>
  )
}

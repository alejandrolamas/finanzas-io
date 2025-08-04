// app/transactions/add/page.tsx
import { TransactionForm } from "@/components/transaction-form"

export default function AddTransactionPage() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Nueva transacción</h1>
        <p className="text-muted-foreground">Añade un nuevo ingreso o gasto.</p>
      </header>
      <TransactionForm />
    </div>
  )
}

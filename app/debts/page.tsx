import { DebtList } from "@/components/debt-list"
import { getDebts } from "@/lib/data/debts"

export default async function DebtsPage() {
  const initialDebts = await getDebts()

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Gestión de deudas</h1>
        <p className="text-muted-foreground">Controla lo que debes y lo que te deben.</p>
      </header>
      <DebtList initialDebts={initialDebts} />
    </div>
  )
}

import { RecurringList } from "@/components/recurring-list"
import { getRecurring } from "@/lib/data/recurring"

export default async function RecurringPage() {
  const initialRecurring = await getRecurring()

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Transacciones recurrentes</h1>
        <p className="text-muted-foreground">Automatiza tus ingresos y gastos fijos.</p>
      </header>
      <RecurringList initialRecurring={initialRecurring} />
    </div>
  )
}

import { getTransactions } from "@/lib/data/transactions"
import { getCategories } from "@/lib/data/categories"
import { StatsClientPage } from "@/components/stats-client-page"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"

export default async function StatsPage() {
  // Obtenemos los datos iniciales en el servidor
  const [transactions, categories] = await Promise.all([getTransactions(), getCategories()])

  // Si no hay transacciones, mostramos un mensaje y la página de estadísticas vacía
  // para que al menos pueda interactuar con los filtros o ver la estructura.
  if (!transactions || transactions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Estadísticas</h1>
            <p className="text-muted-foreground">Analiza tus finanzas en detalle.</p>
          </div>
        </div>
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>No se encontraron datos</AlertTitle>
          <AlertDescription>
            No hemos podido cargar ninguna transacción. Empieza por añadir tu primera transacción para ver tus
            estadísticas.
          </AlertDescription>
        </Alert>
        {/* Renderizamos el cliente para que la página no esté completamente vacía */}
        <StatsClientPage initialTransactions={[]} categories={categories || []} />
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estadísticas</h1>
          <p className="text-muted-foreground">Analiza tus finanzas en detalle.</p>
        </div>
      </div>
      <StatsClientPage initialTransactions={transactions} categories={categories} />
    </>
  )
}

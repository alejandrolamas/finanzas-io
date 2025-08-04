// app/transfers/add/page.tsx
import { TransferForm } from "@/components/transfer-form"

export default function AddTransferPage() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Nueva transferencia</h1>
        <p className="text-muted-foreground">Mueve dinero entre tus cuentas.</p>
      </header>
      <TransferForm />
    </div>
  )
}

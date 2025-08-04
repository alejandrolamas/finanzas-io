import { AccountList } from "@/components/account-list"
import { getAccounts } from "@/lib/data/accounts"

export default async function AccountsPage() {
  const initialAccounts = await getAccounts()

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Cuentas bancarias</h1>
        <p className="text-muted-foreground">Gestiona tus cuentas de ahorro, inversión y corrientes.</p>
      </header>
      <AccountList initialAccounts={initialAccounts} />
    </div>
  )
}

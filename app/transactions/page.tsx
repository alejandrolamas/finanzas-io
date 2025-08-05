import { getTransactions } from "@/lib/data/transactions"
import { TransactionClientPage } from "@/components/transaction-client-page"

export default async function TransactionsPage() {
  const transactions = await getTransactions()
  return <TransactionClientPage initialTransactions={transactions} />
}

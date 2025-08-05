"use server"

import { getTransactionById as getTransactionData } from "@/lib/data/transactions"

export async function getTransaction(id: string) {
  const transaction = await getTransactionData(id)
  return transaction
}

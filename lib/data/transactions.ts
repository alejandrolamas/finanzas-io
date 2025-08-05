// lib/data/transactions.ts
import "server-only"
import dbConnect from "@/lib/dbConnect"
import Transaction from "@/models/Transaction"
import { requireAuth } from "@/lib/auth"
import mongoose from "mongoose"

export async function getTransactions() {
  try {
    const { userId: userIdString } = await requireAuth()
    const userId = new mongoose.Types.ObjectId(userIdString)
    await dbConnect()

    const transactions = await Transaction.find({ userId })
      .populate("category", "name color")
      .populate("account", "name")
      .sort({ date: -1 })
    return JSON.parse(JSON.stringify(transactions))
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return []
  }
}

export async function getTransactionById(id: string) {
  try {
    const { userId: userIdString } = await requireAuth()
    const userId = new mongoose.Types.ObjectId(userIdString)
    await dbConnect()

    const transaction = await Transaction.findOne({ _id: id, userId })
    if (!transaction) return null

    return JSON.parse(JSON.stringify(transaction))
  } catch (error) {
    console.error("Error fetching transaction by id:", error)
    return null
  }
}

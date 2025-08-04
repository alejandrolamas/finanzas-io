// lib/data/accounts.ts
import "server-only" // Asegura que este código solo se ejecute en el servidor
import dbConnect from "@/lib/dbConnect"
import Account from "@/models/Account"
import { requireAuth } from "@/lib/auth"
import mongoose from "mongoose"

export async function getAccounts() {
  try {
    const { userId: userIdString } = await requireAuth()
    const userId = new mongoose.Types.ObjectId(userIdString)
    await dbConnect()
    const accounts = await Account.find({ userId }).sort({ name: 1 })
    // Serializamos los datos para pasarlos de Server a Client Components
    return JSON.parse(JSON.stringify(accounts))
  } catch (error) {
    console.error("Error fetching accounts:", error)
    return []
  }
}

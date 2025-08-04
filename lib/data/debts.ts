// lib/data/debts.ts
import "server-only"
import dbConnect from "@/lib/dbConnect"
import Debt from "@/models/Debt"
import { requireAuth } from "@/lib/auth"
import mongoose from "mongoose"

export async function getDebts() {
  try {
    const { userId: userIdString } = await requireAuth()
    const userId = new mongoose.Types.ObjectId(userIdString)
    await dbConnect()
    const debts = await Debt.find({ userId }).sort({ dueDate: 1 })
    return JSON.parse(JSON.stringify(debts))
  } catch (error) {
    console.error("Error fetching debts:", error)
    return []
  }
}

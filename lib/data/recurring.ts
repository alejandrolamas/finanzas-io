// lib/data/recurring.ts
import "server-only"
import dbConnect from "@/lib/dbConnect"
import Recurring from "@/models/Recurring"
import { requireAuth } from "@/lib/auth"
import mongoose from "mongoose"

export async function getRecurring() {
  try {
    const { userId: userIdString } = await requireAuth()
    const userId = new mongoose.Types.ObjectId(userIdString)
    await dbConnect()
    const recurring = await Recurring.find({ userId }).populate("category").populate("account").sort({ nextDate: 1 })
    return JSON.parse(JSON.stringify(recurring))
  } catch (error) {
    console.error("Error fetching recurring transactions:", error)
    return []
  }
}

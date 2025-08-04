// lib/data/transfers.ts
import "server-only"
import dbConnect from "@/lib/dbConnect"
import Transfer from "@/models/Transfer"
import { requireAuth } from "@/lib/auth"
import mongoose from "mongoose"

export async function getTransfers() {
  try {
    const { userId: userIdString } = await requireAuth()
    const userId = new mongoose.Types.ObjectId(userIdString)
    await dbConnect()
    const transfers = await Transfer.find({ userId })
      .populate("fromAccount", "name")
      .populate("toAccount", "name")
      .sort({ date: -1 })
    return JSON.parse(JSON.stringify(transfers))
  } catch (error) {
    console.error("Error fetching transfers:", error)
    return []
  }
}

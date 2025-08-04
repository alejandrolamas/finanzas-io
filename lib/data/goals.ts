// lib/data/goals.ts
import "server-only"
import dbConnect from "@/lib/dbConnect"
import Goal from "@/models/Goal"
import { requireAuth } from "@/lib/auth"
import mongoose from "mongoose"

export async function getGoals() {
  try {
    const { userId: userIdString } = await requireAuth()
    const userId = new mongoose.Types.ObjectId(userIdString)
    await dbConnect()
    const goals = await Goal.find({ userId }).sort({ deadline: 1 })
    return JSON.parse(JSON.stringify(goals))
  } catch (error) {
    console.error("Error fetching goals:", error)
    return []
  }
}

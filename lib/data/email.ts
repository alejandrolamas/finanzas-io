// lib/data/email.ts
import "server-only"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import { requireAuth } from "@/lib/auth"
import mongoose from "mongoose"

export async function getUserEmail() {
  try {
    const { userId: userIdString } = await requireAuth()
    const userId = new mongoose.Types.ObjectId(userIdString)
    await dbConnect()
    const user = await User.findOne({ _id: userId })
    if (!user || !user.email) {
      throw new Error("No email found for this user")
    }
    const email = user.email || null
    return JSON.parse(JSON.stringify(email))
  } catch (error) {
    console.error("Error fetching email:", error)
    return []
  }
}

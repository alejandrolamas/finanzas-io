import "server-only"
import dbConnect from "@/lib/dbConnect"
import Account from "@/models/Account"
import Category from "@/models/Category"
import { requireAuth } from "@/lib/auth"
import mongoose from "mongoose"

export async function getUserSetupStatus() {
  try {
    const { userId: userIdString } = await requireAuth()
    if (!userIdString) {
      return { hasAccounts: false, hasCategories: false, setupComplete: false }
    }
    const userId = new mongoose.Types.ObjectId(userIdString)
    await dbConnect()

    const accountCount = await Account.countDocuments({ userId })
    const categoryCount = await Category.countDocuments({ userId })

    const hasAccounts = accountCount > 0
    const hasCategories = categoryCount > 0
    const setupComplete = hasAccounts && hasCategories

    return { hasAccounts, hasCategories, setupComplete }
  } catch (error) {
    console.error("Error fetching user setup status:", error)
    return { hasAccounts: false, hasCategories: false, setupComplete: false }
  }
}

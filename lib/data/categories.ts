// lib/data/categories.ts
import "server-only"
import dbConnect from "@/lib/dbConnect"
import Category from "@/models/Category"
import { requireAuth } from "@/lib/auth"
import mongoose from "mongoose"

export async function getCategories() {
  try {
    const { userId: userIdString } = await requireAuth()
    const userId = new mongoose.Types.ObjectId(userIdString)
    await dbConnect()
    const categories = await Category.find({ userId }).sort({ name: 1 })
    return JSON.parse(JSON.stringify(categories))
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}

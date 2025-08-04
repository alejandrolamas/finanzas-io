// app/api/budgets/summary/route.ts
import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Category from "@/models/Category"
import Transaction from "@/models/Transaction"
import { startOfMonth, endOfMonth } from "date-fns"
import mongoose from "mongoose"
import { requireAuth } from "@/lib/auth"

export async function GET() {
  try {
    const { userId: userIdString } = await requireAuth()
    const userId = new mongoose.Types.ObjectId(userIdString)
    await dbConnect()

    // 1. Obtener todas las categorías con un presupuesto definido
    const categoriesWithBudget = await Category.find({ userId, budget: { $gt: 0 } })

    if (categoriesWithBudget.length === 0) {
      return NextResponse.json({ success: true, data: [] })
    }

    const categoryIds = categoriesWithBudget.map((c) => c._id)

    // 2. Calcular el gasto total para esas categorías en el mes actual
    const expenses = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: "expense",
          category: { $in: categoryIds },
          date: { $gte: startOfMonth(new Date()), $lte: endOfMonth(new Date()) },
        },
      },
      {
        $group: {
          _id: "$category",
          spent: { $sum: "$amount" },
        },
      },
    ])

    // 3. Unir los datos
    const budgetSummary = categoriesWithBudget.map((category) => {
      const expenseData = expenses.find((e) => e._id.equals(category._id))
      const spent = expenseData ? expenseData.spent : 0
      return {
        _id: category._id,
        name: category.name,
        budget: category.budget,
        spent,
        remaining: category.budget! - spent,
      }
    })

    return NextResponse.json({ success: true, data: budgetSummary })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

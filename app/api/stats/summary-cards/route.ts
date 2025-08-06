import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Account from "@/models/Account"
import Transaction from "@/models/Transaction"
import Recurring from "@/models/Recurring"
import mongoose from "mongoose"
import { requireAuth } from "@/lib/auth"

export async function GET() {
  try {
    const { userId: userIdString } = await requireAuth()
    const userId = new mongoose.Types.ObjectId(userIdString)

    await dbConnect()

    // 1. Account Balances
    const accounts = await Account.find({ userId }).lean()
    const transactionTotals = await Transaction.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: "$account",
          netChange: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, "$amount", { $multiply: ["$amount", -1] }],
            },
          },
        },
      },
    ])

    let totalBalance = 0
    const accountBalances = accounts.map((account) => {
      const accountTotal = transactionTotals.find((t) => t._id.equals(account._id))
      const currentBalance = account.initialBalance + (accountTotal ? accountTotal.netChange : 0)
      totalBalance += currentBalance
      return {
        _id: account._id.toString(),
        name: account.name,
        balance: currentBalance,
      }
    })

    // 2. Recurring Summaries
    const recurringSummary = await Recurring.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: { frequency: "$frequency", type: "$type" },
          totalAmount: { $sum: "$amount" },
        },
      },
    ])

    const recurringTotals = {
      monthlyIncome: 0,
      monthlyExpense: 0,
      annualIncome: 0,
      annualExpense: 0,
    }

    recurringSummary.forEach((item) => {
      if (item._id.frequency === "mensual") {
        if (item._id.type === "income") {
          recurringTotals.monthlyIncome = item.totalAmount
        } else {
          recurringTotals.monthlyExpense = item.totalAmount
        }
      } else if (item._id.frequency === "anual") {
        if (item._id.type === "income") {
          recurringTotals.annualIncome = item.totalAmount
        } else {
          recurringTotals.annualExpense = item.totalAmount
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        totalBalance,
        accountBalances,
        recurringTotals,
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

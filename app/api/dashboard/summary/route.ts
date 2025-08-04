// app/api/dashboard/summary/route.ts
import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Account from "@/models/Account"
import Transaction from "@/models/Transaction"
import Debt from "@/models/Debt"
import mongoose from "mongoose"
import { startOfMonth, endOfMonth } from "date-fns"
import { requireAuth } from "@/lib/auth"

export async function GET() {
  try {
    // Obtener el usuario autenticado
    const { userId: userIdString } = await requireAuth()
    const userId = new mongoose.Types.ObjectId(userIdString)

    await dbConnect()

    // 1. Obtener todas las cuentas y transacciones
    const accounts = await Account.find({ userId })
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

    // 2. Calcular saldo total y ahorros
    let totalBalance = 0
    let totalSavings = 0
    accounts.forEach((account) => {
      const accountTotal = transactionTotals.find((t) => t._id.equals(account._id))
      const currentBalance = account.initialBalance + (accountTotal ? accountTotal.netChange : 0)
      totalBalance += currentBalance
      if (account.type === "Ahorro") {
        totalSavings += currentBalance
      }
    })

    // 3. Deudas Pendientes Totales
    const debts = await Debt.find({ userId, status: { $ne: "Pagada" } })
    const totalDebts = debts.reduce((sum, debt) => {
      const outstanding = debt.totalAmount - debt.paidAmount
      return debt.type === "Debo" ? sum - outstanding : sum + outstanding
    }, 0)

    // 4. Balance Mensual
    const monthlyTransactions = await Transaction.find({
      userId,
      date: { $gte: startOfMonth(new Date()), $lte: endOfMonth(new Date()) },
    })
    const monthlyBalance = monthlyTransactions.reduce((sum, t) => {
      return t.type === "income" ? sum + t.amount : sum - t.amount
    }, 0)

    return NextResponse.json({
      success: true,
      data: {
        totalBalance,
        totalSavings,
        totalDebts,
        monthlyBalance,
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

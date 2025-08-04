// app/api/stats/overview/route.ts
import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Transaction from "@/models/Transaction"
import mongoose from "mongoose"
import { subMonths, startOfMonth, endOfMonth } from "date-fns"
import { requireAuth } from "@/lib/auth"

export async function GET(request) {
  try {
    const { userId: userIdString } = await requireAuth(request)
    const userId = new mongoose.Types.ObjectId(userIdString)
    await dbConnect()

    // 1. Gastos por categoría del mes actual
    const expensesByCategory = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: "expense",
          date: { $gte: startOfMonth(new Date()), $lte: endOfMonth(new Date()) },
        },
      },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      { $unwind: "$categoryInfo" },
      { $project: { name: "$categoryInfo.name", total: 1, _id: 0 } },
    ])

    // 2. Ingresos vs Gastos de los últimos 6 meses
    const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5))
    const monthlyBalances = await Transaction.aggregate([
      { $match: { userId, date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          ingresos: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
          gastos: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          month: {
            $let: {
              vars: {
                monthsInString: [
                  "",
                  "Ene",
                  "Feb",
                  "Mar",
                  "Abr",
                  "May",
                  "Jun",
                  "Jul",
                  "Ago",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dic",
                ],
              },
              in: { $arrayElemAt: ["$$monthsInString", "$_id.month"] },
            },
          },
          ingresos: 1,
          gastos: 1,
          _id: 0,
        },
      },
    ])

    return NextResponse.json({
      success: true,
      data: { expensesByCategory, monthlyBalances },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

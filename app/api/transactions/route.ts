import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Transaction from "@/models/Transaction"
import mongoose from "mongoose"
import { requireAuth } from "@/lib/auth"
import Account from "@/models/Account"

export async function POST(request: Request) {
  try {
    const { userId: userIdString } = await requireAuth()
    const userId = new mongoose.Types.ObjectId(userIdString)

    await dbConnect()
    const body = await request.json()

    const { type, amount } = body as { type: "income" | "expense"; amount: number }
    const accountId = new mongoose.Types.ObjectId(body.account)

    // Traer cuenta y verificar pertenencia
    const account = await Account.findOne({ _id: accountId, userId })
    if (!account) {
      return NextResponse.json({ success: false, error: "Cuenta no encontrada." }, { status: 404 })
    }

    // Si no existe balance, calcularlo desde transacciones e inicial y persistirlo
    let available: number
    if (account.balance === undefined || account.balance === null) {
      const txs = await Transaction.find({ userId, account: account._id }).select("amount type")
      const net = txs.reduce((sum, t) => sum + (t.type === "income" ? t.amount : -t.amount), 0)
      available = (account.initialBalance || 0) + net
      await Account.updateOne({ _id: account._id, userId }, { $set: { balance: available } })
    } else {
      available = account.balance
    }

    // Bloquear gastos mayores al disponible
    if (type === "expense" && amount > available) {
      return NextResponse.json(
        {
          success: false,
          error: "El importe supera el saldo disponible de la cuenta seleccionada.",
          meta: { available },
        },
        { status: 400 },
      )
    }

    // Crear transacción
    const newTransaction = new Transaction({
      ...body,
      userId,
    })
    await newTransaction.save()

    // Actualizar saldo de la cuenta incrementalmente
    if (type === "income") {
      await Account.updateOne({ _id: accountId, userId }, { $inc: { balance: amount } })
    } else if (type === "expense") {
      await Account.updateOne({ _id: accountId, userId }, { $inc: { balance: -amount } })
    }

    // Devolver con populate
    const populatedTransaction = await Transaction.findById(newTransaction._id)
      .populate("category", "name color")
      .populate("account", "name")

    return NextResponse.json({ success: true, data: populatedTransaction }, { status: 201 })
  } catch (error) {
    console.error(error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 })
  }
}

export async function GET(request: Request) {
  try {
    const { userId: userIdString } = await requireAuth()
    const userId = new mongoose.Types.ObjectId(userIdString)

    await dbConnect()
    const { searchParams } = new URL(request.url)

    const query: any = { userId }

    if (searchParams.get("type")) {
      query.type = searchParams.get("type")
    }
    if (searchParams.get("description")) {
      query.description = { $regex: searchParams.get("description"), $options: "i" }
    }
    if (searchParams.get("startDate")) {
      query.date = { ...query.date, $gte: new Date(searchParams.get("startDate")!) }
    }
    if (searchParams.get("endDate")) {
      query.date = { ...query.date, $lte: new Date(searchParams.get("endDate")!) }
    }
    if (searchParams.get("categories")) {
      query.category = { $in: searchParams.get("categories")!.split(",") }
    }
    if (searchParams.get("accounts")) {
      query.account = { $in: searchParams.get("accounts")!.split(",") }
    }

    const transactions = await Transaction.find(query)
      .populate("category", "name color")
      .populate("account", "name")
      .sort({ createdAt: -1 }) // newest first

    return NextResponse.json({ success: true, data: transactions })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

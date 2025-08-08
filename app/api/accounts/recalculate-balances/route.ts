import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import mongoose from "mongoose"
import { requireAuth } from "@/lib/auth"
import Account from "@/models/Account"
import Transaction from "@/models/Transaction"

export async function POST() {
  try {
    const { userId: userIdString } = await requireAuth()
    const userId = new mongoose.Types.ObjectId(userIdString)
    await dbConnect()

    // Obtener cuentas del usuario que no tengan balance definido (null/undefined)
    const accounts = await Account.find({ userId, balance: { $exists: false } })

    let updated = 0
    for (const acc of accounts) {
      const txs = await Transaction.find({ userId, account: acc._id }).select("amount type")
      const net = txs.reduce((sum, t: any) => sum + (t.type === "income" ? t.amount : -t.amount), 0)
      const current = (acc.initialBalance || 0) + net
      const result = await Account.updateOne(
        { _id: acc._id },
        { $set: { balance: current } },
        { upsert: false }
      )
      console.log(`Update result for ${acc.name}:`, result)
      console.log(`Recalculado saldo de cuenta ${acc.name} (${acc._id}): ${current}`)
      updated++
    }

    return NextResponse.json({ success: true, data: { updated } })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error recalc balances"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function GET() {
  // Permitir GET para facilitar pruebas manuales
  return POST()
}

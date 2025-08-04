// app/api/debts/[id]/pay/route.ts
import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Debt from "@/models/Debt"
import { requireAuth } from "@/lib/auth"
import mongoose from "mongoose"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId: userIdString } = await requireAuth()
    const userId = new mongoose.Types.ObjectId(userIdString)
    await dbConnect()
    const { amount } = await request.json()

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ success: false, error: "Importe inválido" }, { status: 400 })
    }

    const debt = await Debt.findOne({ _id: params.id, userId })
    if (!debt) {
      return NextResponse.json({ success: false, error: "Deuda no encontrada" }, { status: 404 })
    }

    debt.paidAmount += amount

    // Lógica para actualizar el estado de la deuda
    if (debt.paidAmount >= debt.totalAmount) {
      debt.paidAmount = debt.totalAmount // Evita pagar de más
      debt.status = "Pagada"
    } else {
      debt.status = "Parcial"
    }

    await debt.save()

    return NextResponse.json({ success: true, data: debt })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

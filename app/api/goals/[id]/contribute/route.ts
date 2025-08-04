// app/api/goals/[id]/contribute/route.ts
import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Goal from "@/models/Goal"
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

    const goal = await Goal.findOne({ _id: params.id, userId })
    if (!goal) {
      return NextResponse.json({ success: false, error: "Objetivo no encontrado" }, { status: 404 })
    }

    goal.currentAmount += amount

    // Opcional: no permitir sobrepasar el objetivo
    if (goal.currentAmount > goal.targetAmount) {
      goal.currentAmount = goal.targetAmount
    }

    await goal.save()

    return NextResponse.json({ success: true, data: goal })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

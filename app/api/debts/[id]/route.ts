// app/api/debts/[id]/route.ts
import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Debt from "@/models/Debt"
import { requireAuth } from "@/lib/auth"
import mongoose from "mongoose"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId: userIdString } = await requireAuth()
    const userId = new mongoose.Types.ObjectId(userIdString)
    await dbConnect()
    const body = await request.json()
    const updatedDebt = await Debt.findOneAndUpdate({ _id: params.id, userId }, body, {
      new: true,
      runValidators: true,
    })
    if (!updatedDebt) {
      return NextResponse.json({ success: false, error: "Debt not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: updatedDebt })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId: userIdString } = await requireAuth()
    const userId = new mongoose.Types.ObjectId(userIdString)
    await dbConnect()
    const deletedDebt = await Debt.findOneAndDelete({ _id: params.id, userId })
    if (!deletedDebt) {
      return NextResponse.json({ success: false, error: "Debt not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: {} })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

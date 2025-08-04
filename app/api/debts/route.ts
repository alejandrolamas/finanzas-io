// app/api/debts/route.ts
import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Debt from "@/models/Debt"
import { requireAuth } from "@/lib/auth"
import mongoose from "mongoose"

export async function POST(request: Request) {
  try {
    const { userId: userIdString } = await requireAuth()
    const userId = new mongoose.Types.ObjectId(userIdString)
    await dbConnect()
    const body = await request.json()
    const newDebt = new Debt({
      ...body,
      userId,
    })
    await newDebt.save()
    return NextResponse.json({ success: true, data: newDebt }, { status: 201 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 })
  }
}

export async function GET() {
  try {
    const { userId: userIdString } = await requireAuth()
    const userId = new mongoose.Types.ObjectId(userIdString)
    await dbConnect()
    const debts = await Debt.find({ userId }).sort({ dueDate: 1 })
    return NextResponse.json({ success: true, data: debts })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

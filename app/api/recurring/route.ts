// app/api/recurring/route.ts
import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Recurring from "@/models/Recurring"
import { requireAuth } from "@/lib/auth"
import mongoose from "mongoose"

export async function POST(request: Request) {
  try {
    const { userId: userIdString } = await requireAuth()
    const userId = new mongoose.Types.ObjectId(userIdString)
    await dbConnect()
    const body = await request.json()
    // La fecha de inicio es también la primera fecha de ejecución
    const newRecurring = new Recurring({
      ...body,
      nextDate: body.startDate,
      userId,
    })
    await newRecurring.save()
    return NextResponse.json({ success: true, data: newRecurring }, { status: 201 })
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
    const recurrings = await Recurring.find({ userId }).populate("category").populate("account").sort({ nextDate: 1 })
    return NextResponse.json({ success: true, data: recurrings })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

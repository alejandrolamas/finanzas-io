// app/api/goals/route.ts
import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Goal from "@/models/Goal"
import { requireAuth } from "@/lib/auth"
import mongoose from "mongoose"

export async function POST(request: Request) {
  try {
    const { userId: userIdString } = await requireAuth()
    const userId = new mongoose.Types.ObjectId(userIdString)
    await dbConnect()
    const body = await request.json()
    const newGoal = new Goal({
      ...body,
      userId,
    })
    await newGoal.save()
    return NextResponse.json({ success: true, data: newGoal }, { status: 201 })
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
    const goals = await Goal.find({ userId }).sort({ deadline: 1 })
    return NextResponse.json({ success: true, data: goals })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

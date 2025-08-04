// app/api/goals/[id]/route.ts
import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Goal from "@/models/Goal"
import { requireAuth } from "@/lib/auth"
import mongoose from "mongoose"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId: userIdString } = await requireAuth()
    const userId = new mongoose.Types.ObjectId(userIdString)
    await dbConnect()
    const body = await request.json()
    const updatedGoal = await Goal.findOneAndUpdate({ _id: params.id, userId }, body, {
      new: true,
      runValidators: true,
    })
    if (!updatedGoal) {
      return NextResponse.json({ success: false, error: "Goal not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: updatedGoal })
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
    const deletedGoal = await Goal.findOneAndDelete({ _id: params.id, userId })
    if (!deletedGoal) {
      return NextResponse.json({ success: false, error: "Goal not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: {} })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

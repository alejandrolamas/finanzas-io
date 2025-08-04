// app/api/recurring/[id]/route.ts
import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Recurring from "@/models/Recurring"
import { requireAuth } from "@/lib/auth"
import mongoose from "mongoose"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId: userIdString } = await requireAuth()
    const userId = new mongoose.Types.ObjectId(userIdString)
    await dbConnect()
    const body = await request.json()
    const updatedRecurring = await Recurring.findOneAndUpdate({ _id: params.id, userId }, body, {
      new: true,
      runValidators: true,
    })
    if (!updatedRecurring) {
      return NextResponse.json({ success: false, error: "Recurring not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: updatedRecurring })
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
    const deletedRecurring = await Recurring.findOneAndDelete({ _id: params.id, userId })
    if (!deletedRecurring) {
      return NextResponse.json({ success: false, error: "Recurring not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: {} })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

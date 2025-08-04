// app/api/accounts/[id]/route.ts
import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Account from "@/models/Account"
import { requireAuth } from "@/lib/auth"
import mongoose from "mongoose"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId: userIdString } = await requireAuth()
    const userId = new mongoose.Types.ObjectId(userIdString)
    await dbConnect()
    const body = await request.json()
    const updatedAccount = await Account.findOneAndUpdate({ _id: params.id, userId }, body, {
      new: true,
      runValidators: true,
    })
    if (!updatedAccount) {
      return NextResponse.json({ success: false, error: "Account not found or access denied" }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: updatedAccount })
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
    const deletedAccount = await Account.findOneAndDelete({ _id: params.id, userId })
    if (!deletedAccount) {
      return NextResponse.json({ success: false, error: "Account not found or access denied" }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: {} })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Transaction from "@/models/Transaction"
import mongoose from "mongoose"
import { requireAuth } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId: userIdString } = await requireAuth()
    const userId = new mongoose.Types.ObjectId(userIdString)

    await dbConnect()
    const transaction = await Transaction.findOne({ _id: params.id, userId })
      .populate("category", "name color")
      .populate("account", "name")

    if (!transaction) {
      return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: transaction })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId: userIdString } = await requireAuth()
    const userId = new mongoose.Types.ObjectId(userIdString)

    await dbConnect()
    const body = await request.json()

    const updatedTransaction = await Transaction.findOneAndUpdate(
      { _id: params.id, userId },
      { ...body, category: body.category, account: body.account },
      { new: true }
    )
      .populate("category", "name color")
      .populate("account", "name")

    if (!updatedTransaction) {
      return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: updatedTransaction })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId: userIdString } = await requireAuth()
    const userId = new mongoose.Types.ObjectId(userIdString)

    await dbConnect()
    const deletedTransaction = await Transaction.findOneAndDelete({ _id: params.id, userId })

    if (!deletedTransaction) {
      return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Transaction deleted successfully" })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

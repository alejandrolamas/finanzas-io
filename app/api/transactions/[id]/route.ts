// app/api/transactions/[id]/route.ts
import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Transaction from "@/models/Transaction"

// GET a single transaction
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()
    const transaction = await Transaction.findById(params.id)
      .populate("category", "name type")
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

// PUT (update) a transaction
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()
    const body = await request.json()
    const updatedTransaction = await Transaction.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    })
    if (!updatedTransaction) {
      return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 })
    }
    // Populate the updated transaction to return full data
    const populatedTransaction = await Transaction.findById(updatedTransaction._id)
      .populate("category", "name type")
      .populate("account", "name")

    return NextResponse.json({ success: true, data: populatedTransaction })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 })
  }
}

// DELETE a transaction
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()
    const deletedTransaction = await Transaction.findByIdAndDelete(params.id)
    if (!deletedTransaction) {
      return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: {} })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

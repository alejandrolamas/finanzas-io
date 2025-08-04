// app/api/categories/[id]/route.ts
import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Category from "@/models/Category"
import Transaction from "@/models/Transaction"
import { requireAuth } from "@/lib/auth"
import mongoose from "mongoose"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId: userIdString } = await requireAuth()
    const userId = new mongoose.Types.ObjectId(userIdString)
    await dbConnect()
    const body = await request.json()
    const updatedCategory = await Category.findOneAndUpdate({ _id: params.id, userId }, body, {
      new: true,
      runValidators: true,
    })
    if (!updatedCategory) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: updatedCategory })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId: userIdString } = await requireAuth()
    const userId = new mongoose.Types.ObjectId(userIdString)
    const categoryId = params.id

    // Check if any transactions are using this category for this user
    const transactionCount = await Transaction.countDocuments({ category: categoryId, userId })
    if (transactionCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `No se puede eliminar. La categoría está en uso por ${transactionCount} transacciones.`,
        },
        { status: 400 },
      )
    }

    const deletedCategory = await Category.findOneAndDelete({ _id: categoryId, userId })
    if (!deletedCategory) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: {} })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

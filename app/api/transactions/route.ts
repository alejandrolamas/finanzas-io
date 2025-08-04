// app/api/transactions/route.ts
import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Transaction from "@/models/Transaction"
import mongoose from "mongoose"
import { requireAuth } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { userId: userIdString } = await requireAuth()
    const userId = new mongoose.Types.ObjectId(userIdString)

    await dbConnect()
    const body = await request.json()

    const newTransaction = new Transaction({
      ...body,
      userId,
    })

    await newTransaction.save()
    return NextResponse.json({ success: true, data: newTransaction }, { status: 201 })
  } catch (error) {
    console.error(error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 })
  }
}

export async function GET(request: Request) {
  try {
    const { userId: userIdString } = await requireAuth()
    const userId = new mongoose.Types.ObjectId(userIdString)

    await dbConnect()
    const { searchParams } = new URL(request.url)

    const query: any = { userId }

    if (searchParams.get("type")) {
      query.type = searchParams.get("type")
    }
    if (searchParams.get("description")) {
      query.description = { $regex: searchParams.get("description"), $options: "i" }
    }
    if (searchParams.get("startDate")) {
      query.date = { ...query.date, $gte: new Date(searchParams.get("startDate")!) }
    }
    if (searchParams.get("endDate")) {
      query.date = { ...query.date, $lte: new Date(searchParams.get("endDate")!) }
    }
    if (searchParams.get("categories")) {
      query.category = { $in: searchParams.get("categories")!.split(",") }
    }
    if (searchParams.get("accounts")) {
      query.account = { $in: searchParams.get("accounts")!.split(",") }
    }

    const transactions = await Transaction.find(query)
      .populate("category", "name")
      .populate("account", "name")
      .sort({ date: -1 })

    return NextResponse.json({ success: true, data: transactions })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

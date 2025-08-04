// app/api/accounts/route.ts
import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Account from "@/models/Account"
import { requireAuth } from "@/lib/auth"
import mongoose from "mongoose"

export async function POST(request: Request) {
  try {
    const { userId: userIdString } = await requireAuth()
    const userId = new mongoose.Types.ObjectId(userIdString)
    await dbConnect()
    const body = await request.json()
    const newAccount = new Account({
      ...body,
      userId,
    })
    await newAccount.save()
    return NextResponse.json({ success: true, data: newAccount }, { status: 201 })
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
    const accounts = await Account.find({ userId }).sort({ name: 1 })
    return NextResponse.json({ success: true, data: accounts })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

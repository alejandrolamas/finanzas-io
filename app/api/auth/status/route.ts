// app/api/auth/status/route.ts
import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"

export async function GET() {
  try {
    await dbConnect()
    const userCount = await User.countDocuments()
    return NextResponse.json({ isSetupComplete: userCount > 0 })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}

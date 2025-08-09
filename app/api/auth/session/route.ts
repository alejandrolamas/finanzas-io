// app/api/auth/session/route.ts
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"

export async function GET() {
  try {
    const user = await requireAuth()
    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json(null, { status: 401 })
  }
}

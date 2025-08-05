import { NextResponse } from "next/server"
import { getAccounts } from "@/lib/data/accounts"
import { getCategories } from "@/lib/data/categories"
import { requireAuth } from "@/lib/auth"

export async function GET() {
  try {
    await requireAuth() // Ensure user is authenticated

    const accounts = await getAccounts()
    const categories = await getCategories()

    const hasAccounts = accounts.length > 0
    const hasCategories = categories.length > 0

    return NextResponse.json({
      data: {
        hasAccounts,
        hasCategories,
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes("Authentication required")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    console.error("Error fetching setup status:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}

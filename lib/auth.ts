// lib/auth.ts
import { cookies } from "next/headers"
import mongoose from "mongoose"
import { log } from "console"

export interface UserSession {
  userId: string
  username: string
  email?: string
}

export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return null
    }

    const sessionData = JSON.parse(sessionCookie.value) as UserSession

    // Validar que el ID es un ObjectId válido de Mongoose
    if (!mongoose.Types.ObjectId.isValid(sessionData.userId)) {
      return null
    }
    return sessionData
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export async function requireAuth(): Promise<UserSession> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}

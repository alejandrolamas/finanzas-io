// app/api/auth/[action]/route.ts
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import bcrypt from "bcryptjs"
import { requireAuth } from "@/lib/auth"

async function setAuthCookies(userId: string, username: string) {
  const cookieStore = cookies()
  const sessionData = { userId, username }

  cookieStore.set("session", JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 semana
    path: "/",
  })
}

export async function POST(request: Request, { params }: { params: { action: string } }) {
  await dbConnect()
  const { action } = params

  if (action === "setup") {
    try {
      const userCount = await User.countDocuments()
      if (userCount > 0) {
        return NextResponse.json({ success: false, error: "Setup already completed" }, { status: 409 })
      }

      const { username, password } = await request.json()
      if (!password || password.length < 6) {
        return NextResponse.json({ success: false, error: "Password must be at least 6 characters" }, { status: 400 })
      }

      const hashedPassword = await bcrypt.hash(password, 10)
      const newUser = new User({ username, password: hashedPassword })
      await newUser.save()

      await setAuthCookies(newUser._id.toString(), newUser.username)

      return NextResponse.json({ success: true, data: { userId: newUser._id, username: newUser.username } })
    } catch (error) {
      return NextResponse.json({ success: false, error: "Error during setup" }, { status: 500 })
    }
  }

  if (action === "signup") {
    try {
      const { username, password } = await request.json()
      if (!password || password.length < 6) {
        return NextResponse.json(
          { success: false, error: "La contraseña debe tener al menos 6 caracteres." },
          { status: 400 },
        )
      }
      const existingUser = await User.findOne({ username: username.toLowerCase() })
      if (existingUser) {
        return NextResponse.json({ success: false, error: "El nombre de usuario ya existe." }, { status: 409 })
      }

      const hashedPassword = await bcrypt.hash(password, 10)
      const newUser = new User({ username, password: hashedPassword })
      await newUser.save()

      await setAuthCookies(newUser._id.toString(), newUser.username)

      return NextResponse.json({ success: true, data: { userId: newUser._id, username: newUser.username } })
    } catch (error) {
      return NextResponse.json({ success: false, error: "Error durante el registro." }, { status: 500 })
    }
  }

  if (action === "login") {
    try {
      const { username, password } = await request.json()
      const user = await User.findOne({ username: username.toLowerCase() })

      if (!user) {
        return NextResponse.json({ success: false, error: "Credenciales inválidas" }, { status: 401 })
      }

      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
        return NextResponse.json({ success: false, error: "Credenciales inválidas" }, { status: 401 })
      }

      await setAuthCookies(user._id.toString(), user.username)

      return NextResponse.json({ success: true })
    } catch (error) {
      return NextResponse.json({ success: false, error: "Error en la petición" }, { status: 400 })
    }
  }

  if (action === "logout") {
    const cookieStore = cookies()
    cookieStore.delete("session")
    return NextResponse.json({ success: true })
  }

  if (action === "change-password") {
    try {
      const { userId } = await requireAuth()
      const { oldPassword, newPassword } = await request.json()

      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: "La nueva contraseña debe tener al menos 6 caracteres." },
          { status: 400 },
        )
      }

      const user = await User.findById(userId)
      if (!user) {
        return NextResponse.json({ success: false, error: "Usuario no encontrado." }, { status: 404 })
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password)
      if (!isMatch) {
        return NextResponse.json({ success: false, error: "La contraseña actual es incorrecta." }, { status: 401 })
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10)
      user.password = hashedNewPassword
      await user.save()

      return NextResponse.json({ success: true, message: "Contraseña actualizada con éxito." })
    } catch (error) {
      return NextResponse.json({ success: false, error: "Error al cambiar la contraseña." }, { status: 500 })
    }
  }

  return NextResponse.json({ success: false, error: "Acción no válida" }, { status: 404 })
}

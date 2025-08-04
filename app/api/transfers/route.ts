// app/api/transfers/route.ts
import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Transfer from "@/models/Transfer"
import Transaction from "@/models/Transaction"
import Account from "@/models/Account"
import Category from "@/models/Category" // Importar el modelo Category
import mongoose from "mongoose"
import { requireAuth } from "@/lib/auth"

export async function POST(request: Request) {
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const { userId: userIdString } = await requireAuth()
    const userId = new mongoose.Types.ObjectId(userIdString)
    await dbConnect()
    const body = await request.json()
    const { fromAccountId, toAccountId, amount, description, date } = body

    // Lógica de la transferencia dentro de una transacción de BD
    const fromAccount = await Account.findOne({ _id: fromAccountId, userId }).session(session)
    const toAccount = await Account.findOne({ _id: toAccountId, userId }).session(session)

    if (!fromAccount || !toAccount) {
      throw new Error("Una de las cuentas no fue encontrada o no pertenece al usuario.")
    }

    // --- INICIO DE LA LÓGICA DINÁMICA DE CATEGORÍA ---
    // Buscar o crear la categoría "Transferencia" para el usuario
    let transferCategory = await Category.findOne({ name: "Transferencia", userId }).session(session)

    if (!transferCategory) {
      // Si no existe, la creamos. Usamos 'expense' como tipo por defecto.
      const newCat = await Category.create(
        [
          {
            name: "Transferencia",
            type: "expense",
            userId: userId,
            color: "#64748b", // Un color neutral (slate)
          },
        ],
        { session },
      )
      transferCategory = newCat[0]
    }
    // --- FIN DE LA LÓGICA DINÁMICA DE CATEGORÍA ---

    // 1. Crear la transferencia
    const newTransfer = new Transfer({
      fromAccount: fromAccountId,
      toAccount: toAccountId,
      amount,
      description,
      date,
      userId,
    })
    await newTransfer.save({ session })

    // 2. Crear transacción de gasto
    await Transaction.create(
      [
        {
          type: "expense",
          amount,
          description: `Transferencia a ${toAccount.name}`,
          category: transferCategory._id, // Usar el ID de la categoría dinámica
          account: fromAccountId,
          date,
          userId,
        },
      ],
      { session },
    )

    // 3. Crear transacción de ingreso
    await Transaction.create(
      [
        {
          type: "income",
          amount,
          description: `Transferencia desde ${fromAccount.name}`,
          category: transferCategory._id, // Usar el mismo ID de categoría dinámica
          account: toAccountId,
          date,
          userId,
        },
      ],
      { session },
    )

    await session.commitTransaction()
    return NextResponse.json({ success: true, data: newTransfer }, { status: 201 })
  } catch (error) {
    await session.abortTransaction()
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 })
  } finally {
    session.endSession()
  }
}

export async function GET() {
  try {
    const { userId: userIdString } = await requireAuth()
    const userId = new mongoose.Types.ObjectId(userIdString)
    await dbConnect()
    const transfers = await Transfer.find({ userId })
      .populate("fromAccount", "name")
      .populate("toAccount", "name")
      .sort({ date: -1 })
    return NextResponse.json({ success: true, data: transfers })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

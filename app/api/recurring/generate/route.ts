// app/api/recurring/generate/route.ts
import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Recurring from "@/models/Recurring"
import Transaction from "@/models/Transaction"
import { addDays, addWeeks, addMonths, addYears } from "date-fns"

export async function POST() {
  try {
    await dbConnect()
    const now = new Date()
    const recurringsToProcess = await Recurring.find({ nextDate: { $lte: now } })

    let generatedCount = 0

    for (const recurring of recurringsToProcess) {
      // 1. Crear la nueva transacción
      await Transaction.create({
        type: recurring.type,
        amount: recurring.amount,
        description: `(Recurrente) ${recurring.description}`,
        category: recurring.category,
        account: recurring.account,
        date: recurring.nextDate,
        userId: recurring.userId,
      })

      // 2. Calcular la siguiente fecha de ejecución
      let newNextDate: Date
      switch (recurring.frequency) {
        case "diaria":
          newNextDate = addDays(recurring.nextDate, 1)
          break
        case "semanal":
          newNextDate = addWeeks(recurring.nextDate, 1)
          break
        case "mensual":
          newNextDate = addMonths(recurring.nextDate, 1)
          break
        case "anual":
          newNextDate = addYears(recurring.nextDate, 1)
          break
        default:
          // Si la frecuencia no es válida, la desactivamos para evitar bucles infinitos
          newNextDate = addYears(now, 100)
      }

      // 3. Actualizar la regla recurrente con la nueva fecha
      recurring.nextDate = newNextDate
      await recurring.save()
      generatedCount++
    }

    return NextResponse.json({
      success: true,
      message: `${generatedCount} transacciones recurrentes generadas.`,
      generatedCount,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

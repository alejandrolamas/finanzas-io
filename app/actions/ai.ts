"use server"

import { generateText, generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import dbConnect from "@/lib/dbConnect"
import Transaction from "@/models/Transaction"
import mongoose from "mongoose"
import { requireAuth } from "@/lib/auth"
import { z } from "zod"
import type { ITransaction } from "@/models/Transaction"

// Función para generar la frase motivadora
export async function generateMotivationalPhrase() {
  try {
    // 1. Obtener el usuario autenticado de forma segura.
    const { userId: userIdString } = await requireAuth()
    const userId = new mongoose.Types.ObjectId(userIdString)

    // 2. Conectar a la BD y obtener transacciones SOLO de ese usuario.
    await dbConnect()
    const transactions = await Transaction.find({ userId }).sort({ date: -1 }).limit(15)

    // Si no hay transacciones, devolver una frase genérica.
    if (transactions.length === 0) {
      return "Empieza a registrar tus movimientos para recibir consejos personalizados. ¡Tú puedes!"
    }

    const recentTransactions = transactions
      .map((t) => `${t.type === "expense" ? "Gasto" : "Ingreso"} de ${t.amount}€ en ${t.description}`)
      .join(", ")

    const prompt = `Basado en estas transacciones recientes de un usuario (${recentTransactions}), escribe una frase corta (1-2 líneas), motivadora e inteligente sobre finanzas personales. Sé positivo y alentador.`

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
    })
    return text
  } catch (error) {
    console.error("Error generating motivational phrase:", error)
    // Frase de fallback en caso de error en la API de OpenAI.
    return "Cada pequeño paso que das hoy te acerca a tus grandes metas financieras de mañana."
  }
}

// Función para el chat financiero que devuelve un stream de texto
// export async function askFinancialQuestion(history: any[], question: string, transactions: ITransaction[]) {
//   const transactionSummary = transactions
//     .slice(0, 50) // Usamos más transacciones para el análisis
//     .map((t) => `${t.type} of ${t.amount}€ for ${t.description} on ${new Date(t.date).toLocaleDateString()}`)
//     .join("\n")
//
//   const systemPrompt = `Eres un asistente financiero experto y amigable llamado 'Financiero.io'. Analiza los datos de transacciones del usuario para responder sus preguntas. Los datos son: \n${transactionSummary}\n. Ofrece respuestas claras, accionables y en formato Markdown. Cuando des una respuesta, hazlo como si estuvieras escribiendo en tiempo real.`
//
//   const { textStream } = await streamText({
//     model: openai("gpt-4o-mini"),
//     system: systemPrompt,
//     messages: [...history, { role: "user", content: question }],
//   })
//
//   return textStream
//

// NUEVA FUNCIÓN para generar previsiones financieras
export async function generateFinancialForecast(transactions: ITransaction[]) {
  try {
    // Simplificamos las transacciones para el prompt
    const transactionSummary = transactions
      .slice(0, 100) // Limitar a las últimas 100 transacciones para no exceder el límite de tokens
      .map((t) => `(${t.type}, ${t.amount}€, ${new Date(t.date).toISOString().split("T")[0]})`)
      .join("\n")

    const forecastSchema = z.object({
      nextMonth: z.object({
        income: z.number().describe("Previsión total de ingresos para el próximo mes."),
        expenses: z.number().describe("Previsión total de gastos para el próximo mes."),
        savings: z.number().describe("Previsión de ahorro (ingresos - gastos) para el próximo mes."),
      }),
      yearlyForecast: z
        .array(
          z.object({
            month: z.string().describe("Mes en formato 'YYYY-MM'."),
            income: z.number().describe("Previsión de ingresos para este mes."),
            expenses: z.number().describe("Previsión de gastos para este mes."),
          }),
        )
        .length(12)
        .describe("Una previsión mes a mes para los próximos 12 meses."),
    })

    const { object: forecast } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: forecastSchema,
      prompt: `Basado en el siguiente historial de transacciones (tipo, importe, fecha):\n${transactionSummary}\n\nCalcula una previsión financiera. Sé realista y basa tus cálculos en los patrones de ingresos y gastos observados. Considera la estacionalidad si es posible.`,
    })

    return forecast
  } catch (error) {
    console.error("Error generating financial forecast:", error)
    throw new Error("No se pudo generar la previsión.")
  }
}

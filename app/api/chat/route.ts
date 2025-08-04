// app/api/chat/route.ts
import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import dbConnect from "@/lib/dbConnect"
import Transaction from "@/models/Transaction"
import mongoose from "mongoose"
import { requireAuth } from "@/lib/auth"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()
  const { userId: userIdString } = await requireAuth()
  const userId = new mongoose.Types.ObjectId(userIdString)

  // Obtener transacciones recientes para dar contexto a la IA
  await dbConnect()
  const transactions = await Transaction.find({ userId }).sort({ date: -1 }).limit(50)
  const transactionSummary = transactions
    .map((t: any) => `${t.type} of ${t.amount}€ for ${t.description} on ${new Date(t.date).toLocaleDateString()}`)
    .join("\n")

  const systemPrompt = `Eres 'Finanzas.io', un coach financiero personal, cercano y motivador. Tu objetivo es ayudar al usuario a entender sus finanzas de una forma sencilla y darle ánimo.

**Tus reglas de comunicación son:**
1.  **Tono Humano y Positivo:** Habla siempre de forma amigable y empática, como si fueras un amigo que sabe mucho de finanzas. Usa un lenguaje positivo y evita ser demasiado técnico o robótico. ¡Anima al usuario!
2.  **Respuestas Breves:** Sé conciso. Responde en 2 o 3 párrafos cortos como máximo. Ve al grano y evita respuestas largas y listas detalladas, a menos que el usuario las pida explícitamente.
3.  **Sin Formato Markdown:** NO uses Markdown. No uses \`###\` para títulos, \`**\` para negritas, ni \`*\` o \`-\` para listas. Escribe en texto plano, usando saltos de línea para separar párrafos y hacer la lectura fácil.
4.  **Interpretación, no solo datos:** No te limites a listar las transacciones. Ofrece una interpretación inteligente. Por ejemplo, en lugar de decir "Gastaste 307.4€ en entretenimiento", podrías decir "Veo que este mes has invertido bastante en pasarlo bien, ¡lo cual es genial! Si buscas ajustar un poco, quizás podríamos explorar opciones de ocio más económicas para el futuro".
5.  **Contexto:** Basa tus respuestas en el historial de transacciones que te proporciono a continuación para que tus consejos sean relevantes.

Aquí tienes el resumen de transacciones del usuario:
${transactionSummary}`

  const result = await streamText({
    model: openai("gpt-4o-mini"),
    system: systemPrompt,
    messages,
  })

  return result.toAIStreamResponse()
}

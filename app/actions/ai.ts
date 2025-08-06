"use server"

import { generateText, generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import dbConnect from "@/lib/dbConnect"
import Transaction from "@/models/Transaction"
import Account from "@/models/Account"
import Recurring from "@/models/Recurring"
import mongoose from "mongoose"
import { requireAuth } from "@/lib/auth"
import { z } from "zod"
import type { ITransaction } from "@/models/Transaction"

// Función para generar la frase motivacional
export async function generateMotivationalPhrase() {
  try {
    const { userId: userIdString } = await requireAuth()
    const userId = new mongoose.Types.ObjectId(userIdString)

    await dbConnect()

    // 1. Calcular saldo total
    const accounts = await Account.find({ userId })
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)

    // 2. Analizar transacciones del último mes
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    const recentTransactions = await Transaction.find({ userId, date: { $gte: oneMonthAgo } }).populate("category")

    if (recentTransactions.length === 0) {
      return "Empieza a registrar tus movimientos para recibir consejos personalizados. ¡Tú puedes!"
    }

    let income = 0
    let expenses = 0
    const spendingByCategory: { [key: string]: number } = {}

    recentTransactions.forEach((t) => {
      if (t.type === "income") {
        income += t.amount
      } else {
        expenses += t.amount
        if (t.category) {
          const categoryName = (t.category as any).name
          spendingByCategory[categoryName] = (spendingByCategory[categoryName] || 0) + t.amount
        }
      }
    })

    const savings = income - expenses
    const topCategory = Object.entries(spendingByCategory).sort((a, b) => b[1] - a[1])[0]

    // 3. Construir un prompt más completo y humano
    const prompt = `
      Eres un coach financiero amigable y cercano. Tu objetivo es dar una frase motivadora y útil a un usuario basándote en su situación financiera actual. Sé positivo y constructivo.

      Aquí tienes los datos del usuario del último mes:
      - Saldo total actual en todas sus cuentas: ${totalBalance.toFixed(2)}€
      - Ingresos del último mes: ${income.toFixed(2)}€
      - Gastos del último mes: ${expenses.toFixed(2)}€
      - Ahorro neto del último mes: ${savings.toFixed(2)}€
      - Principal categoría de gasto: ${topCategory ? `${topCategory[0]} con ${topCategory[1].toFixed(2)}€` : "Ninguna"}

      Ahora, genera una frase corta (1-2 líneas) que refleje esta situación. Considera estos escenarios:
      - SIEMPRE genera el texto de la siguiente manera, genera un número aleatorio entre 1 y 3, no me digas nunca el resultado, limítate a dar el texto solicitado, si toca 1 escribe sobre los ahorros, si es 2 escribe sobre gastos, si es 3 escribe sobre el saldo total. Siempre sé positivo sea cual sea el caso. De manera aleatoria elige entre el parámetro a usar.
      - Si detectas en gastos e ingresos cantidades con exactamente el mismo importe y categoría "Transferencia" (ej: -500 y +500) probablemente sea porque es traspaso entre cuentas, así que no has de tener estos gastos en cuenta.
      - Sólo Si vas a escribir sobre ahorro y este es muy positivo (>20% de los ingresos), felicítale por su disciplina.
      - Sólo si el número aleatorio es el 1, entonces indica el % real de ahorro que ha conseguido, anímale a seguir así, quizás sugiriendo invertir o mover dinero a la cuenta de ahorros para que genere intereses.
      - Sólo Si vas a escribir sobre ahorro y este bajo o negativo, anímale de forma sutil a revisar sus gastos, especialmente en su categoría principal, sin ser alarmista.
      - Sólo Si vas a escribir sobre saldo total y este es alto (más de 50 mil euros), reconócelo como un gran logro de constancia.
      - Sólo Si vas a escribir sobre gastos y estos son mucho más altos que sus ingresos, ofrécele apoyo y recuérdale que cada pequeño cambio cuenta, anima a usar el asistente para que le pueda ayudar a ahorrar y quitarse gastos.

      Adapta tu tono para que sea personal, cercano y alentador. No uses jerga financiera compleja.
    `

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
    })
    return text
  } catch (error) {
    console.error("Error generating motivational phrase:", error)
    return "Cada pequeño paso que das hoy te acerca a tus grandes metas financieras de mañana."
  }
}

// NUEVA FUNCIÓN para generar previsiones financieras
export async function generateFinancialForecast(transactions: ITransaction[]) {
  try {
    const { userId: userIdString } = await requireAuth()
    const userId = new mongoose.Types.ObjectId(userIdString)
    await dbConnect()

    // 1. Obtener transacciones recurrentes para dar más contexto a la IA
    const recurringTransactions = await Recurring.find({ userId })
    const recurringSummary = recurringTransactions
      .map((r) => `Recurrente: ${r.type} de ${r.amount}€ cada ${r.frequency} (${r.description})`)
      .join("\n")

    // 2. Calcular el saldo total actual de forma robusta para asegurar el punto de partida correcto.
    const accounts = await Account.find({ userId }).lean()
    const allUserTransactions = await Transaction.find({ userId }).lean()
    
    let currentTotalBalance = 0
    accounts.forEach(account => {
        const accountTransactions = allUserTransactions.filter(t => t.account.equals(account._id));
        const netChange = accountTransactions.reduce((sum, t) => {
            return sum + (t.type === 'income' ? t.amount : -t.amount);
        }, 0);
        currentTotalBalance += account.initialBalance + netChange;
    });


    const transactionSummary = transactions
      .slice(0, 150) // Aumentamos el número de transacciones para un mejor análisis de tendencia
      .map((t) => `(${t.type}, ${t.amount}€, ${new Date(t.date).toISOString().split("T")[0]})`)
      .join("\n")

    // 3. Actualizar el esquema para incluir ahorro y saldo total
    const forecastSchema = z.object({
      nextMonth: z.object({
        income: z.number().describe("Previsión total de ingresos para el próximo mes."),
        expenses: z.number().describe("Previsión total de gastos para el próximo mes."),
        savings: z.number().describe("Previsión de ahorro (ingresos - gastos) para el próximo mes."),
        totalBalance: z.number().describe("Previsión del saldo total al final del próximo mes."),
      }),
      yearlyForecast: z
        .array(
          z.object({
            month: z.string().describe("Mes en formato 'YYYY-MM'."),
            income: z.number().describe("Previsión de ingresos para este mes."),
            expenses: z.number().describe("Previsión de gastos para este mes."),
            savings: z.number().describe("Ahorro neto proyectado para este mes (ingresos - gastos)."),
            totalBalance: z.number().describe("Saldo total proyectado al final de este mes."),
          }),
        )
        .length(12)
        .describe("Una previsión mes a mes para los próximos 12 meses."),
    })

    // 4. Mejorar el prompt con el nuevo contexto y las instrucciones de análisis de tendencia
    const prompt = `
      Eres un analista financiero experto. Tu tarea es crear una previsión financiera detallada y realista para un usuario para los próximos 12 meses.

      Aquí tienes los datos:
      1.  **Saldo Total Actual**: El punto de partida es ${currentTotalBalance.toFixed(2)}€. Todas las proyecciones de saldo deben empezar desde aquí.
      2.  **Transacciones Recurrentes Fijas**: Estos son movimientos predecibles.
          ${recurringSummary.length > 0 ? recurringSummary : "No hay transacciones recurrentes definidas."}
      3.  **Historial de Transacciones Recientes**: Úsalo para analizar tendencias de ingresos y gastos variables.
          ${transactionSummary}

      Instrucciones Clave para tu análisis:
      - **Análisis de Tendencia (MUY IMPORTANTE)**: Para los ingresos y gastos que NO son recurrentes (variables), no te limites a usar el valor del último mes. Analiza el historial de transacciones para identificar una tendencia o un promedio mensual. Por ejemplo, si los gastos variables de los últimos 3 meses fueron 500€, 600€ y 550€, una proyección razonable para los siguientes meses sería alrededor de 550-570€, no 650€. Aplica esta lógica tanto para ingresos como para gastos.
      - **Cálculo Mensual Total**: Para cada mes de la previsión, el total de 'ingresos' será la suma de (ingresos recurrentes fijos + previsión de ingresos variables por tendencia). Lo mismo para los 'gastos'.
      - **Proyección del Saldo**: El 'totalBalance' de cada mes se calcula a partir del saldo del mes anterior más el 'ahorro' del mes actual. El primer mes parte del 'Saldo Total Actual' proporcionado.
      - **Cuidado con la categoría Transferencias**: Si detectas dos transacciones que se anulan, una positiva y otra negativa del mismo valor y en la misma fecha, se trata de una transferencia entre cuentas, por lo que esas transacciones no debes tenerlas en cuenta para ingresos y gastos, por lo que descuenta los valores en ambos valores.
      - **Consistencia**: Mantén la estabilidad en las proyecciones de ingresos fijos como "Nómina", a menos que el historial muestre claras variaciones.

      Devuelve el resultado en el formato JSON solicitado.
    `

    const { object: forecast } = await generateObject({
      model: openai("gpt-4o"),
      schema: forecastSchema,
      prompt,
    })

    return forecast
  } catch (error) {
    console.error("Error generating financial forecast:", error)
    throw new Error("No se pudo generar la previsión.")
  }
}

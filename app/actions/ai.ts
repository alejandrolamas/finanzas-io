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

/**
 * Filtra las transacciones que son transferencias entre cuentas.
 * Busca pares de transacciones (ingreso y gasto) con el mismo importe en la misma fecha.
 */
function filterOutTransfers(transactions: ITransaction[]): ITransaction[] {
  const transfersToRemove = new Set<string>()
  const potentialIncomes: { [key: string]: ITransaction[] } = {}

  // Agrupar ingresos por fecha e importe
  transactions.forEach((t) => {
    if (t.type === "income") {
      const key = `${new Date(t.date).toISOString().split("T")[0]}_${t.amount}`
      if (!potentialIncomes[key]) {
        potentialIncomes[key] = []
      }
      potentialIncomes[key].push(t)
    }
  })

  // Buscar gastos que coincidan con un ingreso
  transactions.forEach((t) => {
    if (t.type === "expense") {
      const key = `${new Date(t.date).toISOString().split("T")[0]}_${t.amount}`
      if (potentialIncomes[key] && potentialIncomes[key].length > 0) {
        const matchingIncome = potentialIncomes[key].pop() // Usar y remover el ingreso coincidente
        if (matchingIncome) {
          transfersToRemove.add(t._id.toString())
          transfersToRemove.add(matchingIncome._id.toString())
        }
      }
    }
  })

  return transactions.filter((t) => !transfersToRemove.has(t._id.toString()))
}

// Función para generar la frase motivacional
export async function generateMotivationalPhrase() {
  try {
    const { userId: userIdString } = await requireAuth()
    const userId = new mongoose.Types.ObjectId(userIdString)
    await dbConnect()

    const accounts = await Account.find({ userId })
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)

    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    const allRecentTransactions = await Transaction.find({ userId, date: { $gte: oneMonthAgo } }).populate("category").lean()

    // 1. Filtrar transferencias ANTES de hacer cálculos
    const recentTransactions = filterOutTransfers(allRecentTransactions as ITransaction[])

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
    const savingsPercentage = income > 0 ? (savings / income) * 100 : 0
    const topCategory = Object.entries(spendingByCategory).sort((a, b) => b[1] - a[1])[0]

    // 2. Lógica para elegir tema en el código, no en el prompt
    const topicChoice = Math.floor(Math.random() * 3) // 0: Ahorro, 1: Gastos, 2: Saldo
    let prompt = ""

    const basePrompt = `Eres un coach financiero amigable y cercano. Tu objetivo es dar una frase motivadora y útil a un usuario basándote en su situación financiera. Sé positivo, constructivo y cercano. Genera una frase corta (1-2 líneas).`

    switch (topicChoice) {
      case 0: // Ahorro
        prompt = `${basePrompt}
        El tema es el AHORRO.
        Datos: Ahorro neto del último mes: ${savings.toFixed(2)}€ (${savingsPercentage.toFixed(1)}% de los ingresos).
        - Si el ahorro es muy positivo (>20%), felicítale por su disciplina y anímale a seguir así, quizás sugiriendo invertir. Menciona el porcentaje logrado.
        - Si el ahorro es bajo o negativo, anímale de forma sutil a revisar sus gastos, sin ser alarmista.`
        break
      case 1: // Gastos
        prompt = `${basePrompt}
        El tema son los GASTOS.
        Datos: Gastos del último mes: ${expenses.toFixed(2)}€. Ingresos: ${income.toFixed(2)}€. Principal categoría de gasto: ${topCategory ? `${topCategory[0]} con ${topCategory[1].toFixed(2)}€` : "Ninguna"}.
        - Si los gastos son mucho más altos que los ingresos, ofrécele apoyo y recuérdale que cada pequeño cambio cuenta, animándole a usar el asistente de IA para encontrar ideas.
        - Si los gastos son controlados, elógiale por su buena gestión.`
        break
      case 2: // Saldo Total
        prompt = `${basePrompt}
        El tema es el SALDO TOTAL.
        Dato: Saldo total actual: ${totalBalance.toFixed(2)}€.
        - Si el saldo es alto (> 50000€), reconócelo como un gran logro de constancia.
        - Si el saldo es más modesto, anímale diciendo que cada euro ahorrado es un paso hacia sus metas.`
        break
    }

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

    const recurringTransactions = await Recurring.find({ userId })
    const recurringSummary = recurringTransactions
      .map((r) => `Recurrente: ${r.type} de ${r.amount}€ cada ${r.frequency} (${r.description})`)
      .join("\n")

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

    // 1. Filtrar transferencias de los datos de entrada ANTES de pasarlos a la IA
    const filteredForForecast = filterOutTransfers(transactions)

    const transactionSummary = filteredForForecast
      .slice(0, 150)
      .map((t) => `(${t.type}, ${t.amount}€, ${new Date(t.date).toISOString().split("T")[0]})`)
      .join("\n")

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

    // 2. Prompt simplificado, ya que la lógica de transferencias está en el código
    const prompt = `
      Eres un analista financiero experto. Tu tarea es crear una previsión financiera detallada y realista para un usuario para los próximos 12 meses.

      Aquí tienes los datos ya procesados (las transferencias entre cuentas han sido eliminadas):
      1.  **Saldo Total Actual**: El punto de partida es ${currentTotalBalance.toFixed(2)}€. Todas las proyecciones de saldo deben empezar desde aquí.
      2.  **Transacciones Recurrentes Fijas**: Estos son movimientos predecibles.
          ${recurringSummary.length > 0 ? recurringSummary : "No hay transacciones recurrentes definidas."}
      3.  **Historial de Transacciones Recientes**: Úsalo para analizar tendencias de ingresos y gastos variables.
          ${transactionSummary.length > 0 ? transactionSummary : "No hay transacciones variables recientes."}

      Instrucciones Clave para tu análisis:
      - **Análisis de Tendencia (MUY IMPORTANTE)**: Para los ingresos y gastos que NO son recurrentes (variables), analiza el historial para identificar una tendencia o un promedio mensual. Si los gastos variables de los últimos 3 meses fueron 500€, 600€ y 550€, una proyección razonable sería alrededor de 550-570€.
      - **Cálculo Mensual Total**: Para cada mes, el total de 'ingresos' será la suma de (ingresos recurrentes fijos + previsión de ingresos variables por tendencia). Lo mismo para los 'gastos'.
      - **Proyección del Saldo**: El 'totalBalance' de cada mes se calcula a partir del saldo del mes anterior más el 'ahorro' del mes actual.
      - **Consistencia**: Mantén la estabilidad en las proyecciones de ingresos fijos como "Nómina".

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

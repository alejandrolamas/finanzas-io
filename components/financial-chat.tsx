"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"
import { askFinancialQuestion } from "@/app/actions/ai"
import type { ITransaction } from "@/models/Transaction"

export function FinancialChat({ transactions }: { transactions: ITransaction[] }) {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question || isLoading) return

    setIsLoading(true)
    setAnswer("")

    try {
      const stream = await askFinancialQuestion([], question, transactions)

      // Leer el stream y actualizar la respuesta en tiempo real
      for await (const delta of stream) {
        setAnswer((prev) => prev + delta)
      }
    } catch (error) {
      console.error("Error in financial chat:", error)
      setAnswer("Lo siento, no he podido procesar tu pregunta. Inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
      setQuestion("")
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ej: ¿En qué categoría podría reducir gastos?"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
      {answer && (
        <div className="p-4 border rounded-lg bg-background">
          <pre className="whitespace-pre-wrap font-sans text-sm">{answer}</pre>
        </div>
      )}
    </div>
  )
}

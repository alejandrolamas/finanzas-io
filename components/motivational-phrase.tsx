"use client"

import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"
import { generateMotivationalPhrase } from "@/app/actions/ai"

export function MotivationalPhrase() {
  const [phrase, setPhrase] = useState("Generando un consejo para ti...")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getPhrase() {
      setLoading(true)
      try {
        const generatedPhrase = await generateMotivationalPhrase()
        setPhrase(generatedPhrase)
      } catch (error) {
        console.error("Error generating phrase:", error)
        setPhrase("No dejes que los contratiempos te desvíen de tus metas financieras.")
      } finally {
        setLoading(false)
      }
    }
    getPhrase()
  }, [])

  return (
    <div className="flex items-center gap-3 text-muted-foreground italic">
      <Sparkles className="h-5 w-5 text-accent flex-shrink-0" />
      {loading ? <span className="animate-pulse">{phrase}</span> : <p>{phrase}</p>}
    </div>
  )
}

"use client"

import { useEffect, useState, useCallback } from "react"
import { Sparkles, RefreshCw } from "lucide-react"
import { generateMotivationalPhrase } from "@/app/actions/ai"
import { Button } from "./ui/button"

const PHRASE_KEY = "motivationalPhrase"

export function MotivationalPhrase() {
  const [phrase, setPhrase] = useState("Generando un consejo para ti...")
  const [loading, setLoading] = useState(true)

  const getPhrase = useCallback(async (forceRefresh = false) => {
    setLoading(true)
    try {
      if (!forceRefresh) {
        const storedPhrase = sessionStorage.getItem(PHRASE_KEY)
        if (storedPhrase) {
          setPhrase(storedPhrase)
          return
        }
      }

      const generatedPhrase = await generateMotivationalPhrase()
      setPhrase(generatedPhrase)
      sessionStorage.setItem(PHRASE_KEY, generatedPhrase)
    } catch (error) {
      console.error("Error generating phrase:", error)
      setPhrase("No dejes que los contratiempos te desvíen de tus metas financieras.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    getPhrase()
  }, [getPhrase])

  return (
    <div className="flex items-center gap-2 text-muted-foreground italic">
      <Sparkles className="h-5 w-5 text-accent flex-shrink-0" />
      <div className="flex-grow">
        {loading ? <span className="animate-pulse">Generando...</span> : <p>{phrase}</p>}
      </div>
      <Button variant="ghost" size="icon" onClick={() => getPhrase(true)} disabled={loading}>
        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        <span className="sr-only">Generar nueva frase</span>
      </Button>
    </div>
  )
}

"use client"

import { useChat } from "ai/react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Send } from "lucide-react"
import { ScrollArea } from "./ui/scroll-area"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "./ui/avatar"

export function ChatPanel() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat()

  return (
    <Card className="w-[350px] h-[500px] flex flex-col shadow-2xl">
      <CardHeader>
        <CardTitle>Asistente financiero</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {messages.map((m) => (
              <div key={m.id} className={cn("flex gap-2", m.role === "user" ? "justify-end" : "justify-start")}>
                {m.role === "assistant" && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-accent text-black text-xs">Chati</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "p-3 rounded-lg max-w-[80%]",
                    m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                  )}
                >
                  <pre className="whitespace-pre-wrap font-sans text-sm">{m.content}</pre>
                </div>
                {m.role === "user" && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>Tú</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
          <Input value={input} onChange={handleInputChange} placeholder="Escribe tu pregunta..." disabled={isLoading} />
          <Button type="submit" size="icon" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}

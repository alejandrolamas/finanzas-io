"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { MessageSquare, X } from "lucide-react"
import { ChatPanel } from "./chat-panel"
import { AnimatePresence, motion } from "framer-motion"

export function FloatingChatButton() {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <>
      <div className="fixed bottom-20 left-4 md:bottom-6 md:right-6 md:left-auto z-50">
        <Button
          size="icon"
          className="rounded-full w-16 h-16 bg-accent hover:bg-accent-dark text-black shadow-lg"
          onClick={() => setIsChatOpen(!isChatOpen)}
          aria-label={isChatOpen ? "Cerrar chat" : "Abrir chat"}
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={isChatOpen ? "x" : "message"}
              initial={{ rotate: -45, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 45, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              {isChatOpen ? <X className="h-8 w-8" /> : <MessageSquare className="h-8 w-8" />}
            </motion.div>
          </AnimatePresence>
        </Button>
      </div>
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-[10.5rem] left-4 w-[calc(100vw-2rem)] max-w-sm md:bottom-24 md:right-6 md:left-auto md:w-96 z-40 origin-bottom-left md:origin-bottom-right"
          >
            <ChatPanel />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

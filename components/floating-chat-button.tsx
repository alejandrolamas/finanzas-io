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
      <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50">
        <Button
          size="icon"
          className="rounded-full w-16 h-16 bg-accent hover:bg-accent-dark text-black shadow-lg"
          onClick={() => setIsChatOpen(!isChatOpen)}
        >
          {isChatOpen ? <X className="h-8 w-8" /> : <MessageSquare className="h-8 w-8" />}
        </Button>
      </div>
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-40 right-4 md:bottom-24 md:right-6 z-40"
          >
            <ChatPanel />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

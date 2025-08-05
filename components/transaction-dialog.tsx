"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TransactionForm } from "./transaction-form"
import type { ITransaction } from "@/models/Transaction"

interface TransactionDialogProps {
  children: React.ReactNode
  defaultType?: "income" | "expense"
  onSuccess: (transaction: ITransaction) => void
}

export function TransactionDialog({ children, defaultType, onSuccess }: TransactionDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSuccess = (transaction: ITransaction) => {
    onSuccess(transaction)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva Transacción</DialogTitle>
        </DialogHeader>
        <TransactionForm onSuccess={handleSuccess} transaction={null} defaultType={defaultType} />
      </DialogContent>
    </Dialog>
  )
}

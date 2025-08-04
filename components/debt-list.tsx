"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, PlusCircle, Trash2, Edit, HandCoins } from "lucide-react"
import { DebtForm } from "./debt-form"
import type { IDebt } from "@/models/Debt"
import { useToast } from "./ui/use-toast"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"
import { PaymentForm } from "./payment-form"

export function DebtList({ initialDebts }: { initialDebts: IDebt[] }) {
  const [debts, setDebts] = useState<IDebt[]>(initialDebts)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [selectedDebt, setSelectedDebt] = useState<IDebt | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleSuccess = (debt: IDebt) => {
    if (selectedDebt && !isPaymentOpen) {
      setDebts(debts.map((d) => (d._id === debt._id ? debt : d)))
    } else if (isPaymentOpen) {
      setDebts(debts.map((d) => (d._id === debt._id ? debt : d)))
    } else {
      setDebts([...debts, debt])
    }
    setIsFormOpen(false)
    setIsPaymentOpen(false)
    setSelectedDebt(null)
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro? Esta acción es irreversible.")) return
    try {
      await fetch(`/api/debts/${id}`, { method: "DELETE" })
      setDebts(debts.filter((d) => d._id !== id))
      toast({ title: "Deuda eliminada con éxito." })
    } catch (error) {
      toast({ variant: "destructive", title: "Error al eliminar la deuda." })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tus deudas y créditos</CardTitle>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedDebt(null)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Añadir deuda
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedDebt ? "Editar Deuda" : "Nueva Deuda"}</DialogTitle>
            </DialogHeader>
            <DebtForm onSuccess={handleSuccess} debt={selectedDebt} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {debts.map((debt) => {
            const progress = (debt.paidAmount / debt.totalAmount) * 100
            return (
              <div key={debt._id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant={debt.type === "Debo" ? "destructive" : "default"}>{debt.status}</Badge>
                    <p className="font-bold text-lg mt-1">{debt.person}</p>
                    <p className="text-sm text-muted-foreground">{debt.description}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${debt.type === "Debo" ? "text-danger" : "text-success"}`}>
                      {debt.type === "Debo" ? "-" : "+"}€{debt.totalAmount.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Vence: {debt.dueDate ? new Date(debt.dueDate).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedDebt(debt)
                          setIsPaymentOpen(true)
                        }}
                        disabled={debt.status === "Pagada"}
                      >
                        <HandCoins className="mr-2 h-4 w-4" /> Añadir pago
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedDebt(debt)
                          setIsFormOpen(true)
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(debt._id)} className="text-danger">
                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Progreso</span>
                    <span>
                      €{debt.paidAmount.toFixed(2)} / €{debt.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <Progress value={progress} className={debt.type === "Debo" ? "[&>div]:bg-danger" : ""} />
                </div>
              </div>
            )
          })}
        </div>
        <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Añadir pago a deuda</DialogTitle>
            </DialogHeader>
            {selectedDebt && <PaymentForm onSuccess={handleSuccess} debt={selectedDebt} />}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, PlusCircle, Trash2, Edit, TrendingDown, TrendingUp, Zap } from "lucide-react"
import { RecurringForm } from "./recurring-form"
import type { IRecurring } from "@/models/Recurring"
import { useToast } from "./ui/use-toast"
import { Badge } from "./ui/badge"
import { formatEuro } from '@/utils/formatEuro'

export function RecurringList({ initialRecurring }: { initialRecurring: any[] }) {
  const [recurringList, setRecurringList] = useState(initialRecurring)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedRecurring, setSelectedRecurring] = useState<IRecurring | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSuccess = (recurring: IRecurring) => {
    if (selectedRecurring) {
      setRecurringList(recurringList.map((r) => (r._id === recurring._id ? recurring : r)))
    } else {
      setRecurringList([...recurringList, recurring])
    }
    setIsFormOpen(false)
    setSelectedRecurring(null)
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro?")) return
    try {
      await fetch(`/api/recurring/${id}`, { method: "DELETE" })
      setRecurringList(recurringList.filter((r) => r._id !== id))
      toast({ title: "Regla recurrente eliminada." })
    } catch (error) {
      toast({ variant: "destructive", title: "Error al eliminar." })
    }
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const res = await fetch("/api/recurring/generate", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({ title: "Generación completada", description: data.message })
      router.refresh() // Recarga los datos de la página
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      toast({ variant: "destructive", title: "Error al generar", description: errorMessage })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tus Reglas Recurrentes</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGenerate} disabled={isGenerating}>
            <Zap className="h-4 w-4 mr-2" />
            {isGenerating ? "Generando..." : "Forzar Generación"}
          </Button>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedRecurring(null)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Añadir Regla
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedRecurring ? "Editar Regla" : "Nueva Regla Recurrente"}</DialogTitle>
              </DialogHeader>
              <RecurringForm onSuccess={handleSuccess} recurring={selectedRecurring} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {recurringList.map((recurring) => (
            <div
              key={recurring._id}
              className="flex flex-col items-start gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-full ${recurring.type === "income" ? "bg-success/20 text-success" : "bg-danger/20 text-danger"}`}
                >
                  {recurring.type === "income" ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : (
                    <TrendingDown className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{recurring.description}</p>
                  <p className="text-sm text-muted-foreground hidden md:block">
                    Próxima: {new Date(recurring.nextDate).toLocaleDateString()} en{" "}
                    <span className="font-semibold">{recurring.account.name}</span>
                  </p>
                </div>
              </div>
              <div className="self-end sm:self-center flex items-center gap-2">
                <Badge variant="secondary" className="capitalize">
                  {recurring.frequency}
                </Badge>
                <p className={`font-semibold ${recurring.type === "income" ? "text-success" : "text-danger"}`}>
                  {recurring.type === "income" ? "+" : "-"}{formatEuro(recurring.amount)}
                </p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedRecurring(recurring)
                        setIsFormOpen(true)
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(recurring._id)} className="text-danger">
                      <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

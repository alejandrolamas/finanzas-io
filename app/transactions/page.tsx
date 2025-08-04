// app/transactions/page.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, PlusCircle, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { TransactionFilters } from "@/components/transaction-filters"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TransactionForm } from "@/components/transaction-form"
import { useToast } from "@/components/ui/use-toast"
import type { ITransaction } from "@/models/Transaction"

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<ITransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<ITransaction | null>(null)
  const { toast } = useToast()

  const fetchTransactions = useCallback(async (filters = {}) => {
    setLoading(true)
    const query = new URLSearchParams(filters).toString()
    try {
      const res = await fetch(`/api/transactions?${query}`)
      const { data } = await res.json()
      setTransactions(data)
    } catch (error) {
      console.error("Failed to fetch transactions", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const handleFormSuccess = (transaction: ITransaction) => {
    if (editingTransaction) {
      // Si estábamos editando, actualizamos la transacción en la lista
      setTransactions(transactions.map((t) => (t._id === transaction._id ? { ...t, ...transaction } : t)))
    } else {
      // Si era una nueva, la añadimos al principio de la lista
      setTransactions([transaction, ...transactions])
    }
    setIsDialogOpen(false)
    setEditingTransaction(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta transacción?")) return
    if (!confirm("Esta acción es irreversible. ¿Confirmas la eliminación?")) return

    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Error al eliminar")
      setTransactions(transactions.filter((t) => t._id !== id))
      toast({ title: "Transacción eliminada", description: "La transacción ha sido eliminada con éxito." })
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar la transacción." })
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transacciones</h1>
          <p className="text-muted-foreground">Tu historial de movimientos.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingTransaction(null)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Añadir Transacción
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTransaction ? "Editar Transacción" : "Nueva Transacción"}</DialogTitle>
            </DialogHeader>
            <TransactionForm onSuccess={handleFormSuccess} transaction={editingTransaction} />
          </DialogContent>
        </Dialog>
      </header>

      <TransactionFilters onFilterChange={fetchTransactions} />

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Cuenta</TableHead>
              <TableHead className="text-right">Importe</TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((t: any) => (
                <TableRow key={t._id}>
                  <TableCell>{new Date(t.date).toLocaleDateString("es-ES")}</TableCell>
                  <TableCell className="font-medium">{t.description}</TableCell>
                  <TableCell>{t.category?.name || "N/A"}</TableCell>
                  <TableCell>{t.account?.name || "N/A"}</TableCell>
                  <TableCell
                    className={`text-right font-semibold ${t.type === "income" ? "text-success" : "text-danger"}`}
                  >
                    {t.type === "income" ? "+" : "-"}€{t.amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingTransaction(t)
                            setIsDialogOpen(true)
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(t._id)} className="text-danger">
                          <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

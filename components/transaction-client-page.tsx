"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, PlusCircle, Trash2, Edit, Info } from "lucide-react"
import type { ITransaction } from "@/models/Transaction"
import { useToast } from "./ui/use-toast"
import { Badge } from "./ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { TransactionDialog } from "./transaction-dialog"

function TransactionDetails({ transaction }: { transaction: ITransaction }) {
  return (
    <div className="space-y-3 p-4">
      <div>
        <p className="text-sm text-muted-foreground">Categoría</p>
        <p className="font-medium">{(transaction.category as any)?.name || "N/A"}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Cuenta</p>
        <p className="font-medium">{(transaction.account as any)?.name || "N/A"}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Naturaleza</p>
        <p className="font-medium">{transaction.nature}</p>
      </div>
    </div>
  )
}

export function TransactionClientPage({ initialTransactions }: { initialTransactions: ITransaction[] }) {
  const [transactions, setTransactions] = useState<ITransaction[]>(initialTransactions)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<ITransaction | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta transacción?")) return

    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Error al eliminar")
      setTransactions(transactions.filter((t) => t._id !== id))
      toast({ title: "Transacción eliminada con éxito." })
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar la transacción." })
    }
  }

  const handleSuccess = (newTransaction: ITransaction) => {
    // Add the new transaction to the top of the list for immediate feedback
    setTransactions((prev) => [newTransaction, ...prev])
    router.refresh() // Revalidate data in the background
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Transacciones</CardTitle>
        <TransactionDialog onSuccess={handleSuccess}>
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Añadir nueva
          </Button>
        </TransactionDialog>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descripción</TableHead>
                <TableHead className="hidden md:table-cell">Categoría</TableHead>
                <TableHead className="hidden lg:table-cell">Cuenta</TableHead>
                <TableHead className="hidden lg:table-cell">Naturaleza</TableHead>
                <TableHead className="text-right">Importe</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction._id}>
                  <TableCell>
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(transaction.date), "PPP", { locale: es })}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge
                      variant="outline"
                      style={{
                        borderColor: (transaction.category as any)?.color,
                        color: (transaction.category as any)?.color,
                      }}
                    >
                      {(transaction.category as any)?.name}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{(transaction.account as any)?.name}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge variant="secondary">{transaction.nature}</Badge>
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-bold",
                      transaction.type === "income" ? "text-success" : "text-danger",
                    )}
                  >
                    {transaction.type === "income" ? "+" : "-"}€{transaction.amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          className="md:hidden"
                          onClick={() => {
                            setSelectedTransaction(transaction)
                            setIsDetailsOpen(true)
                          }}
                        >
                          <Info className="mr-2 h-4 w-4" /> Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/transactions/add?id=${transaction._id}`}>
                            <Edit className="mr-2 h-4 w-4" /> Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(transaction._id)} className="text-danger">
                          <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalles de la Transacción</DialogTitle>
            </DialogHeader>
            {selectedTransaction && <TransactionDetails transaction={selectedTransaction} />}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

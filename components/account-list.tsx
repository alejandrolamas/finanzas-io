"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, PlusCircle, Trash2, Edit } from "lucide-react"
import { AccountForm } from "./account-form"
import type { IAccount } from "@/models/Account"
import { useToast } from "./ui/use-toast"

export function AccountList({ initialAccounts }: { initialAccounts: IAccount[] }) {
  const [accounts, setAccounts] = useState<IAccount[]>(initialAccounts)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<IAccount | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleFormSuccess = (account: IAccount) => {
    if (editingAccount) {
      setAccounts(accounts.map((a) => (a._id === account._id ? account : a)))
    } else {
      setAccounts([...accounts, account])
    }
    setIsDialogOpen(false)
    setEditingAccount(null)
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta cuenta?")) return

    try {
      const res = await fetch(`/api/accounts/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Error al eliminar")
      setAccounts(accounts.filter((a) => a._id !== id))
      toast({ title: "Cuenta eliminada", description: "La cuenta ha sido eliminada con éxito." })
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar la cuenta." })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tus cuentas</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingAccount(null)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Añadir cuenta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingAccount ? "Editar Cuenta" : "Nueva Cuenta"}</DialogTitle>
            </DialogHeader>
            <AccountForm onSuccess={handleFormSuccess} account={editingAccount} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {accounts.map((account) => (
            <div key={account._id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded-full" style={{ backgroundColor: account.color || "#A1A1AA" }} />
                <div>
                  <p className="font-medium">{account.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {account.type} - {account.bank}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">€{account.initialBalance.toFixed(2)}</p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingAccount(account)
                        setIsDialogOpen(true)
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(account._id)} className="text-danger">
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

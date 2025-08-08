"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useToast } from "@/components/ui/use-toast"
import type { IAccount } from "@/models/Account"
import type { ICategory } from "@/models/Category"
import type { ITransaction } from "@/models/Transaction"

interface TransactionFormProps {
  onSuccess: (transaction: ITransaction) => void
  transaction: ITransaction | null
  defaultType?: "income" | "expense"
}

const formSchema = z.object({
  type: z.enum(["income", "expense"], { required_error: "El tipo es obligatorio." }),
  amount: z.coerce.number().positive("El importe debe ser positivo."),
  description: z.string().min(2, "La descripción es muy corta.").max(100),
  date: z.date({ required_error: "La fecha es obligatoria." }),
  nature: z.enum(["Puntual", "Recurrente", "Extraordinaria"]),
  categoryId: z.string({ required_error: "La categoría es obligatoria." }),
  accountId: z.string({ required_error: "La cuenta es obligatoria." }),
})

// Formateo € con símbolo al final, separador de miles y decimales: 1.234,56 €
function formatEUR(n: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(n)
}

export function TransactionForm({ onSuccess, transaction, defaultType = "expense" }: TransactionFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [accounts, setAccounts] = useState<IAccount[]>([])
  const [categories, setCategories] = useState<ICategory[]>([])
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  // Cargar cuentas y categorías
  useEffect(() => {
    async function fetchData() {
      const [accRes, catRes] = await Promise.all([fetch("/api/accounts"), fetch("/api/categories")])
      const { data: accData } = await accRes.json()
      const { data: catData } = await catRes.json()
      setAccounts(accData || [])
      setCategories(catData || [])

      // Si alguna cuenta no tiene balance, recalcular y refrescar cuentas
      if ((accData || []).some((a: any) => a.balance === undefined || a.balance === null)) {
        try {
          await fetch("/api/accounts/recalculate-balances", { method: "POST" })
          const refreshed = await fetch("/api/accounts")
          const { data: refreshedAccounts } = await refreshed.json()
          setAccounts(refreshedAccounts || [])
        } catch {
          // Silenciar errores
        }
      }
    }
    fetchData()
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "expense",
      amount: 0,
      description: "",
      date: new Date(),
      nature: "Puntual",
    },
  })

  useEffect(() => {
    if (transaction) {
      form.reset({
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        date: new Date(transaction.date),
        nature: transaction.nature || "Puntual",
        categoryId: (transaction.category as any)?._id || (transaction as any).category,
        accountId: (transaction.account as any)?._id || (transaction as any).account,
      })
    } else {
      form.reset({
        type: defaultType,
        amount: 0,
        description: "",
        date: new Date(),
        nature: "Puntual",
        categoryId: undefined,
        accountId: undefined,
      })
    }
  }, [transaction, defaultType, form.reset])

  // Helpers
  const currentType = form.watch("type")
  const selectedAccountId = form.watch("accountId")
  const enteredAmount = form.watch("amount")

  const findAccount = (id?: string) => accounts.find((a: any) => String(a._id) === String(id))
  const getAvailable = (acc?: IAccount) => {
    if (!acc) return 0
    if ((acc as any).balance === undefined || (acc as any).balance === null) {
      // fallback temporal a initialBalance si aún no se ha recalculado
      return acc.initialBalance || 0
    }
    return (acc as any).balance as number
  }

  // Validación cliente: gastos no pueden superar el disponible
  useEffect(() => {
    const acc = findAccount(selectedAccountId)
    const available = getAvailable(acc)
    if (currentType === "expense" && Number(enteredAmount) > available) {
      form.setError("amount", {
        type: "manual",
        message: `El importe supera el saldo disponible (${formatEUR(available)}).`,
      })
    } else {
      if (form.formState.errors.amount?.type === "manual") {
        form.clearErrors("amount")
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccountId, enteredAmount, currentType])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Guardia en cliente
    const acc = findAccount(values.accountId)
    const available = getAvailable(acc)
    if (values.type === "expense" && values.amount > available) {
      form.setError("amount", {
        type: "manual",
        message: `El importe supera el saldo disponible (${formatEUR(available)}).`,
      })
      return
    }

    setIsLoading(true)
    try {
      const localDate = values.date
      const utcDate = new Date(Date.UTC(localDate.getFullYear(), localDate.getMonth(), localDate.getDate(), 12))

      const method = transaction ? "PUT" : "POST"
      const url = transaction ? `/api/transactions/${(transaction as any)._id}` : "/api/transactions"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          date: utcDate,
          category: values.categoryId,
          account: values.accountId,
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => null)
        if (err?.meta?.available !== undefined) {
          form.setError("amount", {
            type: "server",
            message: `El importe supera el saldo disponible (${formatEUR(Number(err.meta.available))}).`,
          })
        }
        throw new Error(err?.error || `Error al ${transaction ? "actualizar" : "crear"} la transacción`)
      }

      const { data } = await response.json()

      toast({
        title: "¡Éxito!",
        description: `La transacción ha sido ${transaction ? "actualizada" : "añadida"} correctamente.`,
        className: "bg-success text-white",
      })
      onSuccess(data)
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo ${transaction ? "actualizar" : "añadir"} la transacción. Inténtalo de nuevo.`,
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <ToggleGroup
                  type="single"
                  variant="outline"
                  value={field.value}
                  onValueChange={(value) => value && field.onChange(value)}
                  className="w-full"
                >
                  <ToggleGroupItem
                    value="expense"
                    aria-label="Gasto"
                    className="w-1/2 data-[state=on]:bg-danger/20 data-[state=on]:text-danger-foreground"
                  >
                    <TrendingDown className="h-4 w-4 mr-2" /> Gasto
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="income"
                    aria-label="Ingreso"
                    className="w-1/2 data-[state=on]:bg-success/20 data-[state=on]:text-success-foreground"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" /> Ingreso
                  </ToggleGroupItem>
                </ToggleGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => {
              const hasError = Boolean(form.formState.errors.amount)
              return (
                <FormItem>
                  <FormLabel>Importe</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0,00"
                      step="0.01"
                      {...field}
                      className={cn(hasError && "border-destructive focus-visible:ring-destructive")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )
            }}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha</FormLabel>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP", { locale: es }) : <span>Elige una fecha</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        if (date) field.onChange(date)
                        setIsCalendarOpen(false)
                      }}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Compra en supermercado" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid md:grid-cols-3 gap-8">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories
                      .filter((c: any) => c.type === form.watch("type"))
                      .map((category: any) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="accountId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cuenta</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {accounts.map((account: any) => {
                      const isExpense = form.watch("type") === "expense"
                      const available = getAvailable(account)
                      const label = isExpense
                        ? `${account.name} — Disponible: ${formatEUR(available)}`
                        : account.name
                      return (
                        <SelectItem key={account._id} value={account._id}>
                          {label}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nature"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Naturaleza</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Puntual">Puntual</SelectItem>
                    <SelectItem value="Recurrente">Recurrente</SelectItem>
                    <SelectItem value="Extraordinaria">Extraordinaria</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isLoading} className="bg-accent hover:bg-accent-dark text-black">
          {isLoading ? "Guardando..." : transaction ? "Actualizar Transacción" : "Guardar Transacción"}
        </Button>
      </form>
    </Form>
  )
}

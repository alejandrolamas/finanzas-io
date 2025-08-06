"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from "@/lib/utils"
import { format, addDays, addWeeks, addMonths, addYears } from "date-fns"
import { es } from "date-fns/locale"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useToast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import type { IAccount } from "@/models/Account"
import type { ICategory } from "@/models/Category"
import type { ITransaction } from "@/models/Transaction"

interface TransactionFormProps {
onSuccess: (transaction: ITransaction) => void
transaction: ITransaction | null
defaultType?: "income" | "expense"
}

const formSchema = z
.object({
  type: z.enum(["income", "expense"], { required_error: "El tipo es obligatorio." }),
  amount: z.coerce.number().positive("El importe debe ser positivo."),
  description: z.string().min(2, "La descripción es muy corta.").max(100),
  date: z.date({ required_error: "La fecha es obligatoria." }),
  nature: z.enum(["Puntual", "Recurrente", "Extraordinaria"]),
  categoryId: z.string({ required_error: "La categoría es obligatoria." }),
  accountId: z.string({ required_error: "La cuenta es obligatoria." }),
  createRecurring: z.boolean().default(false),
  frequency: z.enum(["diaria", "semanal", "mensual", "anual"]).optional(),
})
.refine(
  (data) => {
    if (data.nature === "Recurrente" && data.createRecurring) {
      return !!data.frequency
    }
    return true
  },
  {
    message: "La frecuencia es obligatoria para crear la recurrencia.",
    path: ["frequency"],
  },
)

export function TransactionForm({ onSuccess, transaction, defaultType = "expense" }: TransactionFormProps) {
const { toast } = useToast()
const [isLoading, setIsLoading] = useState(false)
const [accounts, setAccounts] = useState<IAccount[]>([])
const [categories, setCategories] = useState<ICategory[]>([])
const [isCalendarOpen, setIsCalendarOpen] = useState(false)

useEffect(() => {
  async function fetchData() {
    const [accRes, catRes] = await Promise.all([fetch("/api/accounts"), fetch("/api/categories")])
    const { data: accData } = await accRes.json()
    const { data: catData } = await catRes.json()
    setAccounts(accData || [])
    setCategories(catData || [])
  }
  fetchData()
}, [])

const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    type: defaultType,
    amount: 0,
    description: "",
    date: new Date(),
    nature: "Puntual",
    createRecurring: false,
  },
})

const natureValue = form.watch("nature")
const createRecurringValue = form.watch("createRecurring")

useEffect(() => {
  if (transaction) {
    form.reset({
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      date: new Date(transaction.date),
      nature: transaction.nature || "Puntual",
      categoryId: (transaction.category as any)?._id || transaction.category,
      accountId: (transaction.account as any)?._id || transaction.account,
      createRecurring: false, // No permitir crear recurrencia al editar
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
      createRecurring: false,
    })
  }
}, [transaction, defaultType, form.reset])

async function onSubmit(values: z.infer<typeof formSchema>) {
  setIsLoading(true)
  try {
    const localDate = values.date
    const utcDate = new Date(Date.UTC(localDate.getFullYear(), localDate.getMonth(), localDate.getDate(), 12))

    const method = transaction ? "PUT" : "POST"
    const url = transaction ? `/api/transactions/${transaction._id}` : "/api/transactions"

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
      throw new Error(`Error al ${transaction ? "actualizar" : "crear"} la transacción`)
    }

    const { data: newOrUpdatedTransaction } = await response.json()

    if (values.nature === "Recurrente" && values.createRecurring && !transaction) {
      let nextStartDate = values.date
      switch (values.frequency) {
        case "diaria":
          nextStartDate = addDays(values.date, 1)
          break
        case "semanal":
          nextStartDate = addWeeks(values.date, 1)
          break
        case "mensual":
          nextStartDate = addMonths(values.date, 1)
          break
        case "anual":
          nextStartDate = addYears(values.date, 1)
          break
      }
      const nextUtcDate = new Date(
        Date.UTC(nextStartDate.getFullYear(), nextStartDate.getMonth(), nextStartDate.getDate(), 12),
      )

      await fetch("/api/recurring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: values.description,
          amount: values.amount,
          type: values.type,
          frequency: values.frequency,
          startDate: nextUtcDate, // Enviar la siguiente fecha calculada
          category: values.categoryId,
          account: values.accountId,
        }),
      })
    }

    toast({
      title: "¡Éxito!",
      description: `La transacción ha sido ${transaction ? "actualizada" : "añadida"} correctamente.`,
      className: "bg-success text-white",
    })
    onSuccess(newOrUpdatedTransaction)
  } catch (error) {
    toast({
      title: "Error",
      description: `No se pudo ${transaction ? "añadir" : "actualizar"} la transacción. Inténtalo de nuevo.`,
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
                onValueChange={(value) => {
                  if (value) field.onChange(value)
                }}
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
          render={({ field }) => (
            <FormItem>
              <FormLabel>Importe</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0.00" {...field} step="0.01" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
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
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories
                    .filter((c) => c.type === form.watch("type"))
                    .map((category) => (
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
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account._id} value={account._id}>
                      {account.name}
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
          name="nature"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Naturaleza</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
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

      {natureValue === "Recurrente" && !transaction && (
        <div className="space-y-6 rounded-md border bg-muted/50 p-4">
          <FormField
            control={form.control}
            name="createRecurring"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>¿Crear como transacción recurrente automática?</FormLabel>
                  <FormDescription>
                    Esto creará una regla en la sección de Recurrentes para que se genere automáticamente.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          {createRecurringValue && (
            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frecuencia de la recurrencia</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona la frecuencia" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="diaria">Diaria</SelectItem>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="mensual">Mensual</SelectItem>
                      <SelectItem value="anual">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      )}

      <Button type="submit" disabled={isLoading} className="bg-accent hover:bg-accent-dark text-black">
        {isLoading ? "Guardando..." : transaction ? "Actualizar Transacción" : "Guardar Transacción"}
      </Button>
    </form>
  </Form>
)
}

"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import type { IRecurring } from "@/models/Recurring"
import type { IAccount } from "@/models/Account"
import type { ICategory } from "@/models/Category"

const formSchema = z.object({
  description: z.string().min(2, "La descripción es muy corta."),
  amount: z.coerce.number().positive("El importe debe ser positivo."),
  type: z.enum(["income", "expense"]),
  frequency: z.enum(["diaria", "semanal", "mensual", "anual"]),
  startDate: z.date({ required_error: "La fecha de inicio es obligatoria." }),
  categoryId: z.string({ required_error: "La categoría es obligatoria." }),
  accountId: z.string({ required_error: "La cuenta es obligatoria." }),
})

interface RecurringFormProps {
  onSuccess: (recurring: IRecurring) => void
  recurring: IRecurring | null
}

export function RecurringForm({ onSuccess, recurring }: RecurringFormProps) {
  const { toast } = useToast()
  const [accounts, setAccounts] = useState<IAccount[]>([])
  const [categories, setCategories] = useState<ICategory[]>([])

  useEffect(() => {
    async function fetchData() {
      const [accRes, catRes] = await Promise.all([fetch("/api/accounts"), fetch("/api/categories")])
      const { data: accData } = await accRes.json()
      const { data: catData } = await catRes.json()
      setAccounts(accData)
      setCategories(catData)
    }
    fetchData()
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: recurring?.description || "",
      amount: recurring?.amount || 0,
      type: recurring?.type || "expense",
      frequency: recurring?.frequency || "mensual",
      startDate: recurring?.startDate ? new Date(recurring.startDate) : new Date(),
      categoryId: typeof recurring?.category === "string" ? recurring.category : recurring?.category?._id,
      accountId: typeof recurring?.account === "string" ? recurring.account : recurring?.account?._id,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { startDate, ...rest } = values
      const utcStartDate = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 12))
      const method = recurring ? "PUT" : "POST"
      const url = recurring ? `/api/recurring/${recurring._id}` : "/api/recurring"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...rest,
          startDate: utcStartDate, // Usar la fecha corregida
          category: values.categoryId,
          account: values.accountId,
        }),
      })
      if (!res.ok) throw new Error("Error en la petición")
      const { data } = await res.json()
      toast({ title: `Regla ${recurring ? "actualizada" : "creada"} con éxito.` })
      onSuccess(data)
    } catch (error) {
      toast({ variant: "destructive", title: "Error al guardar la regla." })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* ... Campos del formulario (description, amount, type, etc.) ... */}
        {/* Por brevedad, se omite la repetición de los campos del formulario, */}
        {/* ya que son muy similares a los de TransactionForm y DebtForm. */}
        {/* Se incluirían FormFields para cada uno de los campos en el formSchema. */}
        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Suscripción a Netflix" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            name="amount"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Importe</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="type"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="income">Ingreso</SelectItem>
                    <SelectItem value="expense">Gasto</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            name="frequency"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frecuencia</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="diaria">Diaria</SelectItem>
                    <SelectItem value="semanal">Semanal</SelectItem>
                    <SelectItem value="mensual">Mensual</SelectItem>
                    <SelectItem value="anual">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de inicio</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Elige una fecha</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            name="categoryId"
            control={form.control}
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
                      .filter((c) => c.type === form.watch("type"))
                      .map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            name="accountId"
            control={form.control}
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
                    {accounts.map((account) => (
                      <SelectItem key={account._id} value={account._id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>
        <Button type="submit">Guardar regla</Button>
      </form>
    </Form>
  )
}

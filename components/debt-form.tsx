"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import type { IDebt } from "@/models/Debt"
import { useToast } from "./ui/use-toast"
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Calendar } from "./ui/calendar"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

const formSchema = z.object({
  type: z.enum(["Me deben", "Debo"]),
  person: z.string().min(2, "El nombre es obligatorio."),
  totalAmount: z.coerce.number().positive("El importe debe ser mayor que cero."),
  description: z.string().optional(),
  dueDate: z.date().optional(),
})

interface DebtFormProps {
  onSuccess: (debt: IDebt) => void
  debt: IDebt | null
}

export function DebtForm({ onSuccess, debt }: DebtFormProps) {
  const { toast } = useToast()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: debt?.type || "Debo",
      person: debt?.person || "",
      totalAmount: debt?.totalAmount || 0,
      description: debt?.description || "",
      dueDate: debt?.dueDate ? new Date(debt.dueDate) : undefined,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const method = debt ? "PUT" : "POST"
      const url = debt ? `/api/debts/${debt._id}` : "/api/debts"

      const { dueDate, ...rest } = values
      const body: any = { ...rest }

      if (dueDate) {
        // Ajustamos la fecha a mediodía UTC
        body.dueDate = new Date(Date.UTC(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate(), 12))
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error("Error en la petición")
      const { data } = await res.json()
      toast({ title: `Deuda ${debt ? "actualizada" : "creada"} con éxito.` })
      onSuccess(data)
    } catch (error) {
      toast({ variant: "destructive", title: "Error al guardar la deuda." })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          name="type"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de deuda</FormLabel>
              <FormControl>
                <ToggleGroup
                  type="single"
                  variant="outline"
                  value={field.value}
                  onValueChange={field.onChange}
                  className="w-full"
                >
                  <ToggleGroupItem value="Debo" className="w-1/2">
                    Debo
                  </ToggleGroupItem>
                  <ToggleGroupItem value="Me deben" className="w-1/2">
                    Me deben
                  </ToggleGroupItem>
                </ToggleGroup>
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          name="person"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Persona / Entidad</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Juan Pérez" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="totalAmount"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Importe total</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Préstamo para cena" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha de vencimiento (Opcional)</FormLabel>
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
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Guardar deuda</Button>
      </form>
    </Form>
  )
}

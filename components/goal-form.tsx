"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import type { IGoal } from "@/models/Goal"
import { useToast } from "./ui/use-toast"

const formSchema = z.object({
  name: z.string().min(3, "El nombre es muy corto."),
  targetAmount: z.coerce.number().positive("El objetivo debe ser mayor que cero."),
  currentAmount: z.coerce.number().min(0, "El ahorro actual no puede ser negativo.").optional(),
  description: z.string().optional(),
})

interface GoalFormProps {
  onSuccess: (goal: IGoal) => void
  goal: IGoal | null
}

export function GoalForm({ onSuccess, goal }: GoalFormProps) {
  const { toast } = useToast()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: goal || {
      name: "",
      targetAmount: 1000,
      currentAmount: 0,
      description: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const method = goal ? "PUT" : "POST"
      const url = goal ? `/api/goals/${goal._id}` : "/api/goals"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error("Error en la petición")
      const { data } = await res.json()
      toast({ title: `Objetivo ${goal ? "actualizado" : "creado"} con éxito.` })
      onSuccess(data)
    } catch (error) {
      toast({ variant: "destructive", title: "Error al guardar el objetivo." })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del objetivo</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Viaje a Japón" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="targetAmount"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cantidad objetivo (€)</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="currentAmount"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ahorro inicial (€)</FormLabel>
              <FormControl>
                <Input type="number" {...field} disabled={!!goal} />
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
                <Input placeholder="Ahorrar para el vuelo y estancia" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit">Guardar objetivo</Button>
      </form>
    </Form>
  )
}

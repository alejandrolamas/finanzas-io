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
  amount: z.coerce.number().positive("La contribución debe ser positiva."),
})

interface ContributionFormProps {
  onSuccess: (goal: IGoal) => void
  goal: IGoal
}

export function ContributionForm({ onSuccess, goal }: ContributionFormProps) {
  const { toast } = useToast()
  const remainingAmount = goal.targetAmount - goal.currentAmount

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { amount: 0 },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.amount > remainingAmount) {
      form.setError("amount", {
        message: `No puedes añadir más de lo que falta: €${remainingAmount.toFixed(2)}`,
      })
      return
    }

    try {
      const res = await fetch(`/api/goals/${goal._id}/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error("Error al añadir contribución")
      const { data } = await res.json()
      toast({ title: "¡Ahorro añadido con éxito!" })
      onSuccess(data)
    } catch (error) {
      toast({ variant: "destructive", title: "Error al añadir el ahorro." })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <p>
          Objetivo: <span className="font-bold">{goal.name}</span>.
        </p>
        <p>
          Faltan: <span className="font-bold">€{remainingAmount.toFixed(2)}</span> para completarlo.
        </p>
        <FormField
          name="amount"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cantidad a añadir</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Añadir ahorro</Button>
      </form>
    </Form>
  )
}

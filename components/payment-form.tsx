"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import type { IDebt } from "@/models/Debt"
import { useToast } from "./ui/use-toast"
import { formatEuro } from '@/utils/formatEuro'

const formSchema = z.object({
  amount: z.coerce.number().positive("El importe debe ser mayor que cero."),
})

interface PaymentFormProps {
  onSuccess: (debt: IDebt) => void
  debt: IDebt
}

export function PaymentForm({ onSuccess, debt }: PaymentFormProps) {
  const { toast } = useToast()
  const remainingAmount = debt.totalAmount - debt.paidAmount

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { amount: remainingAmount },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.amount > remainingAmount) {
      form.setError("amount", {
        message: `El pago no puede superar lo que queda por pagar: ${formatEuro(remainingAmount)}`,
      })
      return
    }

    try {
      const res = await fetch(`/api/debts/${debt._id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error("Error al registrar el pago")
      const { data } = await res.json()
      toast({ title: "Pago registrado con éxito." })
      onSuccess(data)
    } catch (error) {
      toast({ variant: "destructive", title: "Error al registrar el pago." })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <p>
          Deuda con <span className="font-bold">{debt.person}</span>.
        </p>
        <p>
          Quedan por pagar: <span className="font-bold">{formatEuro(remainingAmount)}</span>
        </p>
        <FormField
          name="amount"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Importe a pagar</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Registrar pago</Button>
      </form>
    </Form>
  )
}

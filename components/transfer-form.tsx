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
import { useToast } from "@/components/ui/use-toast"
import type { IAccount } from "@/models/Account"

const formSchema = z
  .object({
    fromAccountId: z.string({ required_error: "La cuenta de origen es obligatoria." }),
    toAccountId: z.string({ required_error: "La cuenta de destino es obligatoria." }),
    amount: z.coerce.number().positive("El importe debe ser positivo."),
    date: z.date(),
    description: z.string().optional(),
  })
  .refine((data) => data.fromAccountId !== data.toAccountId, {
    message: "La cuenta de origen y destino no pueden ser la misma.",
    path: ["toAccountId"],
  })

export function TransferForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [accounts, setAccounts] = useState<IAccount[]>([])

  useEffect(() => {
    async function fetchAccounts() {
      const res = await fetch("/api/accounts")
      const { data } = await res.json()
      setAccounts(data)
    }
    fetchAccounts()
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { date: new Date() },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const res = await fetch("/api/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error("Error al crear la transferencia")
      toast({ title: "Transferencia realizada con éxito." })
      router.push("/transfers")
      router.refresh()
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo realizar la transferencia." })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
        <div className="grid md:grid-cols-2 gap-8">
          <FormField
            name="fromAccountId"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Desde la cuenta</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona origen" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {accounts.map((acc) => (
                      <SelectItem key={acc._id} value={acc._id}>
                        {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="toAccountId"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hacia la cuenta</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona destino" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {accounts.map((acc) => (
                      <SelectItem key={acc._id} value={acc._id}>
                        {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          name="amount"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Importe a transferir</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Realizar transferencia</Button>
      </form>
    </Form>
  )
}

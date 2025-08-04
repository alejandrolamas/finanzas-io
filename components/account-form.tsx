"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import type { IAccount } from "@/models/Account"
import { useToast } from "./ui/use-toast"

const formSchema = z.object({
  name: z.string().min(2, "El nombre es muy corto."),
  type: z.enum(["Normal", "Ahorro", "Inversión"]),
  initialBalance: z.coerce.number(),
  bank: z.string().optional(),
  color: z.string().optional(),
})

interface AccountFormProps {
  onSuccess: (account: IAccount) => void
  account: IAccount | null
}

export function AccountForm({ onSuccess, account }: AccountFormProps) {
  const { toast } = useToast()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: account || {
      name: "",
      type: "Normal",
      initialBalance: 0,
      bank: "",
      color: "#A1A1AA",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const method = account ? "PUT" : "POST"
      const url = account ? `/api/accounts/${account._id}` : "/api/accounts"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error("Error en la petición")
      const { data } = await res.json()
      toast({
        title: `Cuenta ${account ? "actualizada" : "creada"}`,
        description: "La operación se completó con éxito.",
      })
      onSuccess(data)
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo guardar la cuenta." })
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
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input {...field} />
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
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Ahorro">Ahorro</SelectItem>
                  <SelectItem value="Inversión">Inversión</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="initialBalance"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Saldo Inicial</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="bank"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Banco (Opcional)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="color"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color identificativo</FormLabel>
              <FormControl>
                <Input type="color" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Guardar</Button>
      </form>
    </Form>
  )
}

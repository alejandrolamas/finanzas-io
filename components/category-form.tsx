"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import type { ICategory } from "@/models/Category"
import { useToast } from "./ui/use-toast"

const formSchema = z.object({
  name: z.string().min(2, "El nombre es muy corto."),
  type: z.enum(["income", "expense"]),
  budget: z.coerce.number().min(0).optional().default(0),
  color: z.string().optional(),
})

interface CategoryFormProps {
  onSuccess: (category: ICategory) => void
  category: ICategory | null
}

export function CategoryForm({ onSuccess, category }: CategoryFormProps) {
  const { toast } = useToast()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: category || {
      name: "",
      type: "expense",
      budget: 0,
      color: "#A1A1AA",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const method = category ? "PUT" : "POST"
      const url = category ? `/api/categories/${category._id}` : "/api/categories"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error("Error en la petición")
      const { data } = await res.json()
      toast({
        title: `Categoría ${category ? "actualizada" : "creada"}`,
        description: "La operación se completó con éxito.",
      })
      onSuccess(data)
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo guardar la categoría." })
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
                <Input placeholder="Ej: Comida" {...field} />
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
                  <SelectItem value="expense">Gasto</SelectItem>
                  <SelectItem value="income">Ingreso</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="budget"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Presupuesto mensual (opcional)</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
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

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, PlusCircle, Trash2, Edit, TrendingDown, TrendingUp } from "lucide-react"
import { CategoryForm } from "./category-form"
import type { ICategory } from "@/models/Category"
import { useToast } from "./ui/use-toast"
import { Badge } from "./ui/badge"

export function CategoryList({ initialCategories }: { initialCategories: ICategory[] }) {
  const [categories, setCategories] = useState<ICategory[]>(initialCategories)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleFormSuccess = (category: ICategory) => {
    if (editingCategory) {
      setCategories(categories.map((c) => (c._id === category._id ? category : c)))
    } else {
      setCategories([...categories, category])
    }
    setIsDialogOpen(false)
    setEditingCategory(null)
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta categoría?")) return

    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Error al eliminar")
      setCategories(categories.filter((c) => c._id !== id))
      toast({ title: "Categoría eliminada", description: "La categoría ha sido eliminada con éxito." })
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar la categoría." })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tus categorías</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCategory(null)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Añadir categoría
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
            </DialogHeader>
            <CategoryForm onSuccess={handleFormSuccess} category={editingCategory} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {categories.map((category) => (
            <div key={category._id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded-full" style={{ backgroundColor: category.color || "#A1A1AA" }} />
                <div>
                  <p className="font-medium">{category.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {category.budget && category.budget > 0 ? `Presupuesto: €${category.budget}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={category.type === "expense" ? "outline" : "secondary"}>
                  {category.type === "expense" ? (
                    <TrendingDown className="h-3 w-3 mr-1 text-danger" />
                  ) : (
                    <TrendingUp className="h-3 w-3 mr-1 text-success" />
                  )}
                  {category.type === "expense" ? "Gasto" : "Ingreso"}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingCategory(category)
                        setIsDialogOpen(true)
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(category._id)} className="text-danger">
                      <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

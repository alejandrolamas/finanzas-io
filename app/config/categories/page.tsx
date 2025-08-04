import { CategoryList } from "@/components/category-list"
import { getCategories } from "@/lib/data/categories"

export default async function CategoriesPage() {
  const initialCategories = await getCategories()

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Categorías</h1>
        <p className="text-muted-foreground">Organiza tus ingresos y gastos.</p>
      </header>
      <CategoryList initialCategories={initialCategories} />
    </div>
  )
}

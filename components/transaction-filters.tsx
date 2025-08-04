"use client"

import { useState, useEffect } from "react"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Button } from "./ui/button"
import { X } from "lucide-react"

export function TransactionFilters({ onFilterChange }: { onFilterChange: (filters: any) => void }) {
  const [filters, setFilters] = useState({})
  const [accounts, setAccounts] = useState([])
  const [categories, setCategories] = useState([])

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

  const handleInputChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    if (!value) delete newFilters[key]
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    setFilters({})
    onFilterChange({})
  }

  return (
    <div className="p-4 border rounded-lg flex flex-wrap gap-4 items-end">
      <div className="flex-grow">
        <label className="text-sm font-medium">Descripción</label>
        <Input
          placeholder="Buscar por descripción..."
          onChange={(e) => handleInputChange("description", e.target.value)}
        />
      </div>
      <div className="flex-grow">
        <label className="text-sm font-medium">Tipo</label>
        <Select onValueChange={(v) => handleInputChange("type", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="income">Ingreso</SelectItem>
            <SelectItem value="expense">Gasto</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* Se podrían añadir más filtros como DateRangePicker, Selects para categorías y cuentas */}
      <Button onClick={clearFilters} variant="ghost">
        <X className="h-4 w-4 mr-2" /> Limpiar
      </Button>
    </div>
  )
}

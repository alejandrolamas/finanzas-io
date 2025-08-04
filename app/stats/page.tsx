// app/stats/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const barChartConfig = {
  ingresos: {
    label: "Ingresos",
    color: "hsl(145 63% 45%)",
  },
  gastos: {
    label: "Gastos",
    color: "hsl(0 84% 60%)",
  },
} satisfies ChartConfig

export default function StatsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/stats/overview")
        const { data: statsData } = await res.json()
        setData(statsData)
      } catch (error) {
        console.error("Failed to fetch stats", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <div>Cargando estadísticas...</div>
  }

  const pieChartConfig = data.expensesByCategory.reduce(
    (acc, category, index) => {
      acc[category.name] = {
        label: category.name,
        color: `hsl(var(--chart-${(index % 5) + 1}))`,
      }
      return acc
    },
    {
      total: {
        label: "Total",
      },
    },
  ) satisfies ChartConfig

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Estadísticas y reportes</h1>
        <p className="text-muted-foreground">Visualiza y analiza tu salud financiera.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gastos por categoría (este mes)</CardTitle>
            <CardDescription>Desglose de tus gastos mensuales.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={pieChartConfig} className="min-h-[300px] w-full">
              <PieChart>
                <Pie
                  data={data.expensesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  dataKey="total"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.expensesByCategory.map((entry: any) => (
                    <Cell key={`cell-${entry.name}`} fill={pieChartConfig[entry.name]?.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ingresos vs. Gastos</CardTitle>
            <CardDescription>Comparativa de los últimos 6 meses.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barChartConfig} className="min-h-[300px] w-full">
              <BarChart data={data.monthlyBalances}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="ingresos" fill="var(--color-ingresos)" radius={4} />
                <Bar dataKey="gastos" fill="var(--color-gastos)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

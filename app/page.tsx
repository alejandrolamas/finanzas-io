"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownRight, Banknote, Landmark, PlusCircle, Scale, TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { MotivationalPhrase } from "@/components/motivational-phrase"
import type { ChartConfig } from "@/components/ui/chart"

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

export default function HomePage() {
  const [summary, setSummary] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [budgets, setBudgets] = useState<any>(null)
  const loading = !summary || !stats || !budgets

  useEffect(() => {
    async function fetchData() {
      try {
        const [summaryRes, statsRes, budgetsRes] = await Promise.all([
          fetch("/api/dashboard/summary"),
          fetch("/api/stats/overview"),
          fetch("/api/budgets/summary"),
        ])
        const { data: summaryData } = await summaryRes.json()
        const { data: statsData } = await statsRes.json()
        const { data: budgetsData } = await budgetsRes.json()
        setSummary(summaryData)
        setStats(statsData)
        setBudgets(budgetsData)
      } catch (error) {
        console.error("Failed to fetch dashboard data", error)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div>Cargando dashboard...</div>

  const summaryCards = [
    { title: "Saldo Total", value: `€${summary.totalBalance.toFixed(2)}`, icon: Landmark },
    { title: "Ahorros", value: `€${summary.totalSavings.toFixed(2)}`, icon: Banknote },
    { title: "Deudas", value: `€${summary.totalDebts.toFixed(2)}`, icon: Scale },
    { title: "Balance Mensual", value: `€${summary.monthlyBalance.toFixed(2)}`, icon: TrendingUp },
  ]

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Resumen de tu actividad financiera.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/transactions/add">
              <ArrowDownRight className="h-4 w-4 mr-2" />
              Añadir gasto
            </Link>
          </Button>
          <Button asChild className="bg-accent hover:bg-accent-dark text-black">
            <Link href="/transactions/add">
              <PlusCircle className="h-4 w-4 mr-2" />
              Añadir ingreso
            </Link>
          </Button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <MotivationalPhrase />

      <div className="grid gap-6 md:grid-cols-5">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Ingresos vs. Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barChartConfig} className="min-h-[300px] w-full">
              <BarChart data={stats.monthlyBalances}>
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
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Presupuestos del mes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {budgets.map((b: any) => (
              <div key={b._id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{b.name}</span>
                  <span>
                    €{b.spent.toFixed(2)} / €{b.budget.toFixed(2)}
                  </span>
                </div>
                <Progress
                  value={Math.min((b.spent / b.budget) * 100, 100)}
                  className={b.spent > b.budget ? "[&>div]:bg-danger" : ""}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

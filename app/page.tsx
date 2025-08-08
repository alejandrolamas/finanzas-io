"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownRight, Banknote, Landmark, PlusCircle, Scale, TrendingUp, AlertCircle } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Progress } from "@/components/ui/progress"
import { MotivationalPhrase } from "@/components/motivational-phrase"
import type { ChartConfig } from "@/components/ui/chart"
import { useRouter } from "next/navigation"
import { TransactionDialog } from "@/components/transaction-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { formatEuro } from '@/utils/formatEuro'

const barChartConfig = {
  gastos: {
    label: "Gastos",
    color: "hsl(0 84% 60%)",
  },
  ingresos: {
    label: "Ingresos",
    color: "hsl(145 63% 45%)",
  },
} satisfies ChartConfig

export default function HomePage() {
  const [summary, setSummary] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [budgets, setBudgets] = useState<any>(null)
  const [setupStatus, setSetupStatus] = useState<{ hasAccounts: boolean; hasCategories: boolean } | null>(null)
  const router = useRouter()

  const isLoading = !summary || !stats || !budgets || !setupStatus

  useEffect(() => {
    async function fetchData() {
      try {
        const [summaryRes, statsRes, budgetsRes, setupRes] = await Promise.all([
          fetch("/api/dashboard/summary"),
          fetch("/api/stats/overview"),
          fetch("/api/budgets/summary"),
          fetch("/api/setup/status"),
        ])
        const summaryData = await summaryRes.json()
        const statsData = await statsRes.json()
        const budgetsData = await budgetsRes.json()
        const setupData = await setupRes.json()

        setSummary(summaryData.data)
        setStats(statsData.data)
        setBudgets(budgetsData.data)
        setSetupStatus(setupData.data)
      } catch (error) {
        console.error("Failed to fetch dashboard data", error)
        // Set empty state on error to avoid infinite loading
        setSummary({})
        setStats({})
        setBudgets([])
        setSetupStatus({ hasAccounts: false, hasCategories: false })
      }
    }
    fetchData()
  }, [])

  if (isLoading) return <div className="text-center text-muted-foreground">Cargando dashboard...</div>

  const isSetupComplete = setupStatus?.hasAccounts && setupStatus?.hasCategories

  if (!isSetupComplete) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center h-full pt-10">
        <h1 className="text-3xl font-bold tracking-tight text-center">Bienvenido a Finanzas.io</h1>
        <p className="text-muted-foreground text-center">
          Completa los siguientes pasos para empezar a gestionar tus finanzas.
        </p>
        <div className="w-full max-w-lg space-y-4 mt-6">
          {!setupStatus?.hasAccounts && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Crea tu primera cuenta</AlertTitle>
              <AlertDescription>
                Necesitas al menos una cuenta (ej: "Banco", "Efectivo") para registrar tus transacciones.
                <Link href="/config/accounts" className="font-bold text-primary hover:underline ml-2">
                  Añadir cuenta
                </Link>
              </AlertDescription>
            </Alert>
          )}
          {!setupStatus?.hasCategories && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Crea tu primera categoría</AlertTitle>
              <AlertDescription>
                Necesitas al menos una categoría (ej: "Comida", "Transporte") para clasificar tus gastos.
                <Link href="/config/categories" className="font-bold text-primary hover:underline ml-2">
                  Añadir categoría
                </Link>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    )
  }

  const summaryCards = [
    { title: "Saldo Total", value: formatEuro(summary.totalBalance), icon: Landmark },
    { title: "Ahorros", value: formatEuro(summary.totalSavings), icon: Banknote },
    { title: "Deudas", value: formatEuro(summary.totalDebts), icon: Scale },
    { title: "Balance Mensual", value: formatEuro(summary.monthlyBalance), icon: TrendingUp },
  ]

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Resumen de tu actividad financiera.</p>
        </div>
        <div className="flex items-center gap-2">
          <TransactionDialog defaultType="expense" onSuccess={() => router.refresh()}>
            <Button variant="outline">
              <ArrowDownRight className="h-4 w-4 mr-2" />
              Añadir gasto
            </Button>
          </TransactionDialog>
          <TransactionDialog defaultType="income" onSuccess={() => router.refresh()}>
            <Button className="bg-accent hover:bg-accent-dark text-black">
              <PlusCircle className="h-4 w-4 mr-2" />
              Añadir ingreso
            </Button>
          </TransactionDialog>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
            <div className="w-full overflow-x-auto">
              <ChartContainer config={barChartConfig} className="h-[auto] min-w-[auto]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.monthlyBalances} margin={{ left: -20, right: 10 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 12 }} />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={0}
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      tickFormatter={(value) => formatEuro(value)}
                      width={80}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar 
                      dataKey="gastos" 
                      fill="var(--color-gastos)" 
                      radius={4}
                      
                    />
                    <Bar 
                      dataKey="ingresos" 
                      fill="var(--color-ingresos)" 
                      radius={4} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
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
                    {formatEuro(b.spent)} / {formatEuro(b.budget)}
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

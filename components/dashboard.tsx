"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  ArrowDownRight,
  Banknote,
  Landmark,
  PlusCircle,
  Scale,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
} from "lucide-react"

const summaryCards = [
  { title: "Saldo Total", value: "€12,450.78", change: "+2.5%", changeType: "increase", icon: Landmark },
  { title: "Ahorros", value: "€5,200.00", change: "+€150 este mes", changeType: "increase", icon: Banknote },
  { title: "Deudas Pendientes", value: "€-875.50", change: "2 deudas activas", changeType: "decrease", icon: Scale },
  {
    title: "Balance Mensual",
    value: "+€430.20",
    change: "Ingresos > Gastos",
    changeType: "increase",
    icon: TrendingUp,
  },
]

const chartData = [
  { month: "Ene", ingresos: 1800, gastos: 1400 },
  { month: "Feb", ingresos: 2200, gastos: 1600 },
  { month: "Mar", ingresos: 2100, gastos: 1850 },
  { month: "Abr", ingresos: 2500, gastos: 1700 },
  { month: "May", ingresos: 2300, gastos: 2100 },
  { month: "Jun", ingresos: 2600, gastos: 1900 },
]

const chartConfig = {
  ingresos: { label: "Ingresos", color: "hsl(var(--chart-2))" },
  gastos: { label: "Gastos", color: "hsl(var(--chart-1))" },
}

const upcomingPayments = [
  { name: "Suscripción Netflix", date: "25 Jun", amount: "€12.99", icon: TrendingDown },
  { name: "Alquiler", date: "01 Jul", amount: "€750.00", icon: TrendingDown },
  { name: "Nómina", date: "01 Jul", amount: "€2,600.00", icon: TrendingUp },
  { name: "Gimnasio", date: "05 Jul", amount: "€39.90", icon: TrendingDown },
]

const alerts = [
  { text: "Presupuesto de 'Ocio' al 95%", type: "warning", icon: TriangleAlert },
  { text: "Factura de luz pendiente de pago", type: "danger", icon: TriangleAlert },
  { text: "¡Objetivo 'Fondo de Emergencia' completado!", type: "success", icon: TriangleAlert },
]

export function Dashboard() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Resumen de tu actividad financiera.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <ArrowDownRight className="h-4 w-4 mr-2" />
            Añadir Gasto
          </Button>
          <Button className="bg-accent hover:bg-accent-dark text-black">
            <PlusCircle className="h-4 w-4 mr-2" />
            Añadir Ingreso
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
              <p className={`text-xs ${card.changeType === "increase" ? "text-success" : "text-danger"}`}>
                {card.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Histórico mensual</CardTitle>
            <CardDescription>Ingresos vs. Gastos de los últimos 6 meses.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
              <BarChart data={chartData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `€${value}`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="ingresos" fill="var(--color-ingresos)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="gastos" fill="var(--color-gastos)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos pagos</CardTitle>
            <CardDescription>Movimientos fijos y deudas cercanas.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {upcomingPayments.map((payment) => (
              <div key={payment.name} className="flex items-center">
                <div
                  className={`p-2 rounded-full mr-3 ${payment.icon === TrendingUp ? "bg-success/20 text-success" : "bg-danger/20 text-danger"}`}
                >
                  <payment.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{payment.name}</p>
                  <p className="text-sm text-muted-foreground">{payment.date}</p>
                </div>
                <p className={`font-semibold ${payment.icon === TrendingUp ? "text-success" : ""}`}>{payment.amount}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alertas y notificaciones</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {alerts.map((alert) => (
            <div
              key={alert.text}
              className={`flex items-center p-3 rounded-lg border-l-4 ${
                alert.type === "warning"
                  ? "bg-warning/10 border-warning text-warning-foreground"
                  : alert.type === "danger"
                    ? "bg-danger/10 border-danger text-danger-foreground"
                    : "bg-success/10 border-success text-success-foreground"
              }`}
            >
              <alert.icon
                className={`h-5 w-5 mr-3 ${
                  alert.type === "warning" ? "text-warning" : alert.type === "danger" ? "text-danger" : "text-success"
                }`}
              />
              <p className="text-sm font-medium text-foreground">{alert.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

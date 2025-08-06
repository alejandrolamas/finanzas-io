"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { MultiSelect } from "@/components/ui/multi-select"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  Legend,
  LineChart,
  Line,
} from "recharts"
import { Badge } from "@/components/ui/badge"
import { Download, BrainCircuit, Loader2, Wallet, Landmark, ArrowUpCircle, ArrowDownCircle, CalendarClock } from 'lucide-react'
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { subDays } from "date-fns"
import { generateFinancialForecast } from "@/app/actions/ai"
import type { ITransaction } from "@/models/Transaction"
import type { ICategory } from "@/models/Category"
import jsPDF from "jspdf"
import { StatsPDFReport } from "./stats-pdf-report"
import html2canvas from "html2canvas"
import { SummaryCard } from "./summary-card"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#FF1943", "#19D4FF"]

interface SummaryData {
  totalBalance: number
  accountBalances: { _id: string; name: string; balance: number }[]
  recurringTotals: {
    monthlyIncome: number
    monthlyExpense: number
    annualIncome: number
    annualExpense: number
  }
}

export function StatsClientPage({
  initialTransactions,
  categories,
}: {
  initialTransactions: ITransaction[]
  categories: ICategory[]
}) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  })
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [type, setType] = useState<"all" | "income" | "expense">("all")
  const [forecast, setForecast] = useState<any>(null)
  const [isForecastLoading, setIsForecastLoading] = useState(false)
  const [isPdfLoading, setIsPdfLoading] = useState(false)
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null)
  const [isLoadingSummary, setIsLoadingSummary] = useState(true)

  useEffect(() => {
    async function fetchSummaryData() {
      try {
        setIsLoadingSummary(true)
        const response = await fetch("/api/stats/summary-cards")
        if (!response.ok) throw new Error("Failed to fetch summary")
        const { data } = await response.json()
        setSummaryData(data)
      } catch (error) {
        console.error("Failed to fetch summary data", error)
      } finally {
        setIsLoadingSummary(false)
      }
    }
    fetchSummaryData()
  }, [])

  const filteredTransactions = useMemo(() => {
    if (!initialTransactions) return []
    return initialTransactions.filter((t) => {
      const transactionDate = new Date(t.date)
      const isInDateRange =
        date?.from && date?.to ? transactionDate >= date.from && transactionDate <= date.to : true
      const isCorrectType = type === "all" || t.type === type
      const isInCategory =
        selectedCategories.length === 0 || !t.category || selectedCategories.includes((t.category as any)._id)
      return isInDateRange && isCorrectType && isInCategory
    })
  }, [date, type, selectedCategories, initialTransactions])

  const expensesByCategory = useMemo(() => {
    const expenses = filteredTransactions.filter((t) => t.type === "expense" && t.category)
    const map = new Map<string, { name: string; value: number }>()
    expenses.forEach((t) => {
      const categoryId = (t.category as any)._id
      const categoryName = (t.category as any).name
      const current = map.get(categoryId) || { name: categoryName, value: 0 }
      current.value += t.amount
      map.set(categoryId, current)
    })
    return Array.from(map.values())
  }, [filteredTransactions])

  const incomeVsExpense = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, t) => {
        if (t.type === "income") acc.income += t.amount
        if (t.type === "expense") acc.expense += t.amount
        return acc
      },
      { income: 0, expense: 0 },
    )
  }, [filteredTransactions])

  const handleGenerateForecast = async () => {
    setIsForecastLoading(true)
    setForecast(null)
    try {
      const forecastData = await generateFinancialForecast(filteredTransactions)
      setForecast(forecastData)
    } catch (error) {
      console.error("Error generating forecast:", error)
    } finally {
      setIsForecastLoading(false)
    }
  }

  const handleExportPdf = () => {
    setIsPdfLoading(true)
    const input = document.getElementById("pdf-report")
    if (!input) {
      setIsPdfLoading(false)
      return
    }
    const parent = input.parentElement
    if (!parent) {
      setIsPdfLoading(false)
      return
    }
    const originalParentStyles = {
      position: parent.style.position,
      left: parent.style.left,
      top: parent.style.top,
      overflow: parent.style.overflow,
      width: parent.style.width,
      height: parent.style.height,
    }
    parent.style.position = "absolute"
    parent.style.left = "0"
    parent.style.top = "0"
    parent.style.overflow = "visible"
    parent.style.width = "800px"
    parent.style.height = "auto"
    html2canvas(input, {
      scale: 2,
      useCORS: true,
      windowWidth: 800,
      scrollY: 0,
    })
      .then((canvas) => {
        Object.assign(parent.style, originalParentStyles)
        const imgData = canvas.toDataURL("image/png")
        const pdf = new jsPDF("p", "mm", "a4")
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()
        const imgHeight = (canvas.height * pdfWidth) / canvas.width
        let heightLeft = imgHeight
        let position = 0
        const topMargin = 15
        pdf.addImage(imgData, "PNG", 0, topMargin, pdfWidth, imgHeight)
        heightLeft -= pdfHeight - topMargin
        while (heightLeft > 0) {
          position = heightLeft - imgHeight + topMargin
          pdf.addPage()
          pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight)
          heightLeft -= pdfHeight
        }
        pdf.save(`reporte-estadisticas-${format(new Date(), "yyyy-MM-dd")}.pdf`)
        setIsPdfLoading(false)
      })
      .catch((error) => {
        console.error("Error generating PDF:", error)
        Object.assign(parent.style, originalParentStyles)
        setIsPdfLoading(false)
      })
  }

  const summaryCards = useMemo(() => {
    if (!summaryData) return []
    return [
      {
        title: "Saldo Total",
        value: `${summaryData.totalBalance.toFixed(2)}€`,
        icon: Wallet,
      },
      ...summaryData.accountBalances.map((acc) => ({
        title: `Saldo ${acc.name}`,
        value: `${acc.balance.toFixed(2)}€`,
        icon: Landmark,
      })),
      {
        title: "Ingresos Recurrentes (Mes)",
        value: `${summaryData.recurringTotals.monthlyIncome.toFixed(2)}€`,
        icon: ArrowUpCircle,
        colorClass: "text-green-500",
      },
      {
        title: "Gastos Recurrentes (Mes)",
        value: `${summaryData.recurringTotals.monthlyExpense.toFixed(2)}€`,
        icon: ArrowDownCircle,
        colorClass: "text-red-500",
      },
      {
        title: "Ingresos Recurrentes (Año)",
        value: `${summaryData.recurringTotals.annualIncome.toFixed(2)}€`,
        icon: CalendarClock,
        colorClass: "text-green-500",
      },
      {
        title: "Gastos Recurrentes (Año)",
        value: `${summaryData.recurringTotals.annualExpense.toFixed(2)}€`,
        icon: CalendarClock,
        colorClass: "text-red-500",
      },
    ]
  }, [summaryData])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div />
        <Button onClick={handleExportPdf} disabled={isPdfLoading}>
          {isPdfLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Exportar a PDF
        </Button>
      </div>

      {/* Resumen General */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen General</CardTitle>
          <CardDescription>Una vista rápida de tu situación financiera actual y tus flujos fijos.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {isLoadingSummary
              ? Array.from({ length: 6 }).map((_, i) => (
                  <SummaryCard key={i} isLoading={true} title="" value="" icon={Wallet} />
                ))
              : summaryCards.map((card) => (
                  <SummaryCard
                    key={card.title}
                    isLoading={false}
                    title={card.title}
                    value={card.value}
                    icon={card.icon}
                    colorClass={card.colorClass}
                  />
                ))}
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <DateRangePicker date={date} setDate={setDate} />
          <Select value={type} onValueChange={(v: any) => setType(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo de transacción" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="income">Ingresos</SelectItem>
              <SelectItem value="expense">Gastos</SelectItem>
            </SelectContent>
          </Select>
          <MultiSelect
            options={categories.map((c) => ({ value: c._id, label: c.name }))}
            selected={selectedCategories}
            onChange={setSelectedCategories}
            placeholder="Filtrar categorías..."
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Gastos por Categoría</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] flex items-center justify-center">
            {expensesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expensesByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label={false} labelLine={false}>
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => `${value.toFixed(2)}€`} />
                  <Legend verticalAlign="bottom" wrapperStyle={{ lineHeight: "40px" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground">No hay datos de gastos para mostrar.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ingresos vs Gastos</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] flex items-center justify-center">
            {incomeVsExpense.income > 0 || incomeVsExpense.expense > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ name: "Balance", income: incomeVsExpense.income, expense: incomeVsExpense.expense }]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `€${value}`} />
                  <RechartsTooltip formatter={(value: number) => `${value.toFixed(2)}€`} />
                  <Legend />
                  <Bar dataKey="income" fill="#22c55e" name="Ingresos" />
                  <Bar dataKey="expense" fill="#ef4444" name="Gastos" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground">No hay datos de ingresos o gastos para mostrar.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Previsiones IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Previsiones con IA
            <Button
              size="sm"
              onClick={handleGenerateForecast}
              disabled={isForecastLoading || filteredTransactions.length === 0}
            >
              {isForecastLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <BrainCircuit className="mr-2 h-4 w-4" />
              )}
              Generar Previsión
            </Button>
          </CardTitle>
          <CardDescription>Previsiones generadas en base a los datos filtrados actualmente.</CardDescription>
        </CardHeader>
        {isForecastLoading && (
          <CardContent>
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        )}
        {forecast && !isForecastLoading && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-medium">Ingresos (Próx. Mes)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">{forecast.nextMonth.income.toFixed(2)}€</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-medium">Gastos (Próx. Mes)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-red-600">{forecast.nextMonth.expenses.toFixed(2)}€</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-medium">Ahorro (Próx. Mes)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{forecast.nextMonth.savings.toFixed(2)}€</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-medium">Saldo Total (Próx. Mes)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-600">{forecast.nextMonth.totalBalance.toFixed(2)}€</p>
                </CardContent>
              </Card>
            </div>
            <h3 className="font-semibold mb-2">Previsión Anual</h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecast.yearlyForecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${value}€`} />
                  <RechartsTooltip formatter={(value: number) => `${value.toFixed(2)}€`} />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#22c55e" name="Ingresos" />
                  <Line type="monotone" dataKey="expenses" stroke="#ef4444" name="Gastos" />
                  <Line type="monotone" dataKey="savings" stroke="#f97316" name="Ahorro" />
                  <Line type="monotone" dataKey="totalBalance" stroke="#3b82f6" name="Saldo Total" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Listado de Transacciones */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Transacciones</CardTitle>
          <CardDescription>
            Mostrando {filteredTransactions.length} de {initialTransactions.length} transacciones totales.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Importe</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((t) => (
                    <TableRow key={t._id}>
                      <TableCell>{format(new Date(t.date), "dd/MM/yyyy")}</TableCell>
                      <TableCell>{t.description}</TableCell>
                      <TableCell>
                        {t.category ? (
                          <Badge style={{ backgroundColor: (t.category as any).color || "#ccc", color: "white" }}>
                            {(t.category as any).name}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Sin categoría</Badge>
                        )}
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          t.type === "income" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {t.type === "income" ? "+" : "-"}{t.amount.toFixed(2)}€
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No se encontraron transacciones para los filtros seleccionados.
                      <br />
                      Prueba a cambiar el rango de fechas o las categorías.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Componente Oculto para PDF */}
      <div className="absolute -left-[9999px] top-auto w-[800px] overflow-auto">
        <StatsPDFReport id="pdf-report" transactions={filteredTransactions} dateRange={date} />
      </div>
    </div>
  )
}

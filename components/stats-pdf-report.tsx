"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  Legend,
  Tooltip as RechartsTooltip,
} from "recharts"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import type { ITransaction } from "@/models/Transaction"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#FF1943", "#19D4FF"]

interface StatsPDFReportProps {
  id: string
  transactions: ITransaction[]
  dateRange?: DateRange
}

export function StatsPDFReport({ id, transactions, dateRange }: StatsPDFReportProps) {
  const expensesByCategory = transactions
    .filter((t) => t.type === "expense" && t.category)
    .reduce(
      (acc, t) => {
        const categoryName = (t.category as any).name
        acc[categoryName] = (acc[categoryName] || 0) + t.amount
        return acc
      },
      {} as Record<string, number>,
    )

  const pieData = Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }))

  const incomeVsExpense = transactions.reduce(
    (acc, t) => {
      if (t.type === "income") acc.income += t.amount
      if (t.type === "expense") acc.expense += t.amount
      return acc
    },
    { income: 0, expense: 0 },
  )

  const barData = [{ name: "Balance", ...incomeVsExpense }]

  return (
    <div id={id} className="bg-white p-8 font-sans text-gray-800">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Reporte de estadísticas</h1>
        {dateRange?.from && dateRange?.to && (
          <p className="text-gray-600 mt-2">
            Del <strong className="font-semibold">{format(dateRange.from, "dd/MM/yyyy")}</strong> al{" "}
            <strong className="font-semibold">{format(dateRange.to, "dd/MM/yyyy")}</strong>.
          </p>
        )}
      </div>

      {/* Charts Section - single column layout for better PDF flow */}
      <div className="flex flex-col gap-12">
        {/* Expenses by Category Chart */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-center">Gastos por Categoría</h2>
          <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={false}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value: number) => `${value.toFixed(2)}€`} />
                <Legend verticalAlign="bottom" wrapperStyle={{ lineHeight: "40px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Income vs Expense Chart */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-center">Ingresos vs Gastos</h2>
          <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${value}€`} />
                <RechartsTooltip formatter={(value: number) => `${value.toFixed(2)}€`} />
                <Legend />
                <Bar dataKey="income" fill="#22c55e" name="Ingresos" />
                <Bar dataKey="expense" fill="#ef4444" name="Gastos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Transactions Table Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 text-center">Listado de transacciones</h2>
        <Table className="border-collapse border border-slate-400 w-full text-sm">
          <TableHeader>
            <TableRow>
              <TableHead className="border border-slate-300 p-2 text-gray-800 bg-slate-100">Fecha</TableHead>
              <TableHead className="border border-slate-300 p-2 text-gray-800 bg-slate-100">Descripción</TableHead>
              <TableHead className="border border-slate-300 p-2 text-gray-800 bg-slate-100">Categoría</TableHead>
              <TableHead className="border border-slate-300 p-2 text-gray-800 bg-slate-100 text-right">
                Importe
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((t) => (
              <TableRow key={t._id} className="even:bg-slate-50">
                <TableCell className="border border-slate-300 p-2 text-gray-600">
                  {format(new Date(t.date), "dd/MM/yyyy")}
                </TableCell>
                <TableCell className="border border-slate-300 p-2 text-gray-600">{t.description}</TableCell>
                <TableCell className="border border-slate-300 p-2 text-gray-600">
                  {(t.category as any)?.name || "Sin categoría"}
                </TableCell>
                <TableCell
                  className="border border-slate-300 p-2 text-right"
                  style={{ color: t.type === "income" ? "#16a34a" : "#dc2626" }}
                >
                  {t.type === "income" ? "+" : "-"}{t.amount.toFixed(2)}€
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

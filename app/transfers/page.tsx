import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowRight, PlusCircle } from "lucide-react"
import Link from "next/link"
import { getTransfers } from "@/lib/data/transfers"
import { formatEuro } from '@/utils/formatEuro'

export default async function TransfersPage() {
  const transfers = await getTransfers()

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transferencias</h1>
          <p className="text-muted-foreground">Movimientos entre tus propias cuentas.</p>
        </div>
        <Button asChild>
          <Link href="/transfers/add">
            <PlusCircle className="h-4 w-4 mr-2" />
            Nueva transferencia
          </Link>
        </Button>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Historial de transferencias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Desde</TableHead>
                  <TableHead />
                  <TableHead>Hacia</TableHead>
                  <TableHead className="text-right">Importe</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.map((t: any) => (
                  <TableRow key={t._id}>
                    <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                    <TableCell>{t.fromAccount.name}</TableCell>
                    <TableCell>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                    <TableCell>{t.toAccount.name}</TableCell>
                    <TableCell className="text-right font-medium">{formatEuro(t.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

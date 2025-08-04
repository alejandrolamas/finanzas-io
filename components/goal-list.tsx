"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, PlusCircle, Trash2, Edit, PiggyBank } from "lucide-react"
import { GoalForm } from "./goal-form"
import type { IGoal } from "@/models/Goal"
import { useToast } from "./ui/use-toast"
import { Progress } from "./ui/progress"
import { ContributionForm } from "./contribution-form"

export function GoalList({ initialGoals }: { initialGoals: IGoal[] }) {
  const [goals, setGoals] = useState<IGoal[]>(initialGoals)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isContributionOpen, setIsContributionOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<IGoal | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleSuccess = (goal: IGoal) => {
    if (selectedGoal && !isContributionOpen) {
      setGoals(goals.map((g) => (g._id === goal._id ? goal : g)))
    } else if (isContributionOpen) {
      setGoals(goals.map((g) => (g._id === goal._id ? goal : g)))
    } else {
      setGoals([...goals, goal])
    }
    setIsFormOpen(false)
    setIsContributionOpen(false)
    setSelectedGoal(null)
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este objetivo?")) return
    try {
      await fetch(`/api/goals/${id}`, { method: "DELETE" })
      setGoals(goals.filter((g) => g._id !== id))
      toast({ title: "Objetivo eliminado con éxito." })
    } catch (error) {
      toast({ variant: "destructive", title: "Error al eliminar el objetivo." })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tus objetivos</CardTitle>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedGoal(null)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Nuevo objetivo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedGoal ? "Editar Objetivo" : "Nuevo Objetivo"}</DialogTitle>
            </DialogHeader>
            <GoalForm onSuccess={handleSuccess} goal={selectedGoal} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100
            const isCompleted = progress >= 100
            return (
              <div key={goal._id} className="p-4 border rounded-lg flex flex-col">
                <div className="flex items-start justify-between">
                  <p className="font-bold text-lg">{goal.name}</p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedGoal(goal)
                          setIsContributionOpen(true)
                        }}
                        disabled={isCompleted}
                      >
                        <PiggyBank className="mr-2 h-4 w-4" /> Añadir ahorro
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedGoal(goal)
                          setIsFormOpen(true)
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(goal._id)} className="text-danger">
                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex-grow mt-2">
                  <p className="text-sm text-muted-foreground">{goal.description}</p>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{isCompleted ? "¡Completado!" : "Progreso"}</span>
                    <span>
                      €{goal.currentAmount.toFixed(2)} / €{goal.targetAmount.toFixed(2)}
                    </span>
                  </div>
                  <Progress value={progress} className="[&>div]:bg-accent" />
                </div>
              </div>
            )
          })}
        </div>
        <Dialog open={isContributionOpen} onOpenChange={setIsContributionOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Añadir ahorro al objetivo</DialogTitle>
            </DialogHeader>
            {selectedGoal && <ContributionForm onSuccess={handleSuccess} goal={selectedGoal} />}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

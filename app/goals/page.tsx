import { GoalList } from "@/components/goal-list"
import { getGoals } from "@/lib/data/goals"

export default async function GoalsPage() {
  const initialGoals = await getGoals()

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Objetivos financieros</h1>
        <p className="text-muted-foreground">Define y sigue el progreso de tus metas de ahorro.</p>
      </header>
      <GoalList initialGoals={initialGoals} />
    </div>
  )
}

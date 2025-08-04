// models/Goal.ts
import { type Document, Schema, models, model } from "mongoose"

export interface IGoal extends Document {
  name: string
  targetAmount: number
  currentAmount: number
  deadline?: Date
  description?: string
  userId: Schema.Types.ObjectId
}

const GoalSchema = new Schema<IGoal>(
  {
    name: { type: String, required: true, trim: true },
    targetAmount: { type: Number, required: true },
    currentAmount: { type: Number, required: true, default: 0 },
    deadline: { type: Date },
    description: { type: String, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
)

export default models.Goal || model<IGoal>("Goal", GoalSchema)

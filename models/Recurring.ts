// models/Recurring.ts
import { type Document, Schema, models, model } from "mongoose"

export interface IRecurring extends Document {
  description: string
  amount: number
  type: "income" | "expense"
  frequency: "diaria" | "semanal" | "mensual" | "anual"
  startDate: Date
  nextDate: Date
  category: Schema.Types.ObjectId
  account: Schema.Types.ObjectId
  userId: Schema.Types.ObjectId
}

const RecurringSchema = new Schema<IRecurring>(
  {
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    frequency: { type: String, enum: ["diaria", "semanal", "mensual", "anual"], required: true },
    startDate: { type: Date, required: true },
    nextDate: { type: Date, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    account: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
)

export default models.Recurring || model<IRecurring>("Recurring", RecurringSchema)

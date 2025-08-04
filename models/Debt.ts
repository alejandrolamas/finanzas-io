// models/Debt.ts
import { type Document, Schema, models, model } from "mongoose"

export interface IDebt extends Document {
  type: "Me deben" | "Debo"
  person: string
  totalAmount: number
  paidAmount: number
  description?: string
  dueDate?: Date
  status: "Pendiente" | "Parcial" | "Pagada"
  userId: Schema.Types.ObjectId
}

const DebtSchema = new Schema<IDebt>(
  {
    type: { type: String, enum: ["Me deben", "Debo"], required: true },
    person: { type: String, required: true, trim: true },
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, required: true, default: 0 },
    description: { type: String, trim: true },
    dueDate: { type: Date },
    status: { type: String, enum: ["Pendiente", "Parcial", "Pagada"], default: "Pendiente" },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
)

export default models.Debt || model<IDebt>("Debt", DebtSchema)

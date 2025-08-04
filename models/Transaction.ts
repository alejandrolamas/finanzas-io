// models/Transaction.ts
import type mongoose from "mongoose"
import { type Document, Schema, models, model } from "mongoose"

export interface ITransaction extends Document {
  type: "income" | "expense"
  amount: number
  description: string
  category: mongoose.Schema.Types.ObjectId
  account: mongoose.Schema.Types.ObjectId
  date: Date
  paymentMethod?: string
  imageUrl?: string
  tags?: string[]
  userId: mongoose.Schema.Types.ObjectId // Para futura implementación multi-usuario
}

const TransactionSchema = new Schema<ITransaction>(
  {
    type: { type: String, enum: ["income", "expense"], required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true, trim: true },
    // En una app real, estos serían referencias a otros modelos
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    account: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    date: { type: Date, default: Date.now, required: true },
    paymentMethod: { type: String, trim: true },
    imageUrl: { type: String },
    tags: [{ type: String, trim: true }],
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  },
)

export default models.Transaction || model<ITransaction>("Transaction", TransactionSchema)

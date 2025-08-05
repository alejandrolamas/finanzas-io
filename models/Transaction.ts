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
  nature: "Puntual" | "Recurrente" | "Extraordinaria" // CAMPO AÑADIDO
  paymentMethod?: string
  imageUrl?: string
  tags?: string[]
  userId: mongoose.Schema.Types.ObjectId
}

const TransactionSchema = new Schema<ITransaction>(
  {
    type: { type: String, enum: ["income", "expense"], required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    account: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    date: { type: Date, default: Date.now, required: true },
    nature: {
      type: String,
      enum: ["Puntual", "Recurrente", "Extraordinaria"],
      default: "Puntual",
      required: true,
    }, // CAMPO AÑADIDO
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

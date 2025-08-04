// models/Account.ts
import { type Document, Schema, models, model } from "mongoose"

export interface IAccount extends Document {
  name: string
  type: "Normal" | "Ahorro" | "Inversión"
  initialBalance: number
  bank?: string
  color?: string
  userId: Schema.Types.ObjectId
}

const AccountSchema = new Schema<IAccount>(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["Normal", "Ahorro", "Inversión"], required: true },
    initialBalance: { type: Number, required: true, default: 0 },
    bank: { type: String, trim: true },
    color: { type: String, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
)

export default models.Account || model<IAccount>("Account", AccountSchema)

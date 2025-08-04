// models/Transfer.ts
import { type Document, Schema, models, model } from "mongoose"

export interface ITransfer extends Document {
  fromAccount: Schema.Types.ObjectId
  toAccount: Schema.Types.ObjectId
  amount: number
  commission?: number
  description?: string
  date: Date
  userId: Schema.Types.ObjectId
}

const TransferSchema = new Schema<ITransfer>(
  {
    fromAccount: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    toAccount: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    amount: { type: Number, required: true },
    commission: { type: Number, default: 0 },
    description: { type: String, trim: true },
    date: { type: Date, default: Date.now, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
)

export default models.Transfer || model<ITransfer>("Transfer", TransferSchema)

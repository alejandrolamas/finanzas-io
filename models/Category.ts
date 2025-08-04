// models/Category.ts
import { type Document, Schema, models, model } from "mongoose"

export interface ICategory extends Document {
  name: string
  type: "income" | "expense"
  icon?: string
  color?: string
  budget?: number // CAMPO AÑADIDO
  userId: Schema.Types.ObjectId
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    icon: { type: String, trim: true },
    color: { type: String, trim: true },
    budget: { type: Number, default: 0 }, // CAMPO AÑADIDO
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
)

export default models.Category || model<ICategory>("Category", CategorySchema)

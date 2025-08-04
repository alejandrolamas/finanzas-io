// models/User.ts
import { type Document, Schema, models, model } from "mongoose"

export interface IUser extends Document {
  username: string
  password: string
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
)

export default models.User || model<IUser>("User", UserSchema)

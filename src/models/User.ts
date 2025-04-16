import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  password: string;
  role: "admin" | "user";
}

const UserSchema: Schema = new Schema({
  // _id: { type: String, required: false },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
    required: true,
  },
  // __v: { type: Number, required: false },
});

export const User = mongoose.model<IUser>("User", UserSchema, "role");

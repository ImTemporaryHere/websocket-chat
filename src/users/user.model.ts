import mongoose from "mongoose";

export class User {
  constructor(
    public email: string,
    public password: string,
  ) {}
}

const userSchema = new mongoose.Schema<User>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

export const UserModel = mongoose.model("user", userSchema);

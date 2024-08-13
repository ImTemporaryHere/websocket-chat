import mongoose from "mongoose";

export  type User = {
  name: string,
  password: string,
}


const userSchema = new mongoose.Schema<User>({
  name: { type: String, required: true },
  password: { type: String, required: true },
});

export const UserModel = mongoose.model('user', userSchema);

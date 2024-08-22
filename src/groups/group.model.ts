import mongoose, { Schema } from "mongoose";
import { UserModel } from "../users/user.model";

export interface Group {
  name: string;
  participantsId: Schema.Types.ObjectId[];
  ownerId: Schema.Types.ObjectId;
}

const groupSchema = new mongoose.Schema<Group>({
  name: { type: String, required: true },
  participantsId: [{ type: Schema.Types.ObjectId, ref: UserModel.name }],
  ownerId: { type: Schema.Types.ObjectId, required: true, ref: UserModel.name },
});

export const GroupModel = mongoose.model<Group>("group", groupSchema);

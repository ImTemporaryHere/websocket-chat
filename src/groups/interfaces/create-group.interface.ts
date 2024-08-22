import { Schema } from "mongoose";

export interface CreateGroupInterface {
  name: string;
  participantsId: string[];
  ownerId: string;
}

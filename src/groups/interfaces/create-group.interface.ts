import { Schema } from "mongoose";

export interface ICreateGroup {
  name: string;
  participantsId: string[];
  ownerId: string;
}

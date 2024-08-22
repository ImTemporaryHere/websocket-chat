import { GroupModel, Group } from "./group.model";
import { CreateGroupInterface } from "./interfaces/create-group.interface";
import mongoose from "mongoose";

export class GroupsRepository {
  create(group: CreateGroupInterface) {
    const newGroup = new GroupModel({
      ...group,
      participantsId: group.participantsId.map(
        (id) => new mongoose.Types.ObjectId(id),
      ),
      ownerId: new mongoose.Types.ObjectId(group.ownerId),
    });
    return newGroup.save();
  }
}

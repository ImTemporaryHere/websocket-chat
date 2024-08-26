import { GroupModel, Group } from "./group.model";
import { ICreateGroup } from "./interfaces/create-group.interface";
import mongoose from "mongoose";
import { JoinGroupDto } from "./dto/join-group.dto";

export class GroupsRepository {
  create(group: ICreateGroup) {
    const newGroup = new GroupModel({
      ...group,
      participantsId: group.participantsId.map(
        (id) => new mongoose.Types.ObjectId(id),
      ),
      ownerId: new mongoose.Types.ObjectId(group.ownerId),
    });
    return newGroup.save();
  }

  findOne(id: string) {
    return GroupModel.findById(id).exec();
  }

  remove(groupId: string) {
    return GroupModel.findOneAndDelete({ _id: groupId }).exec();
  }

  updateOne(group: ICreateGroup) {
    return GroupModel.findOneAndUpdate({ group });
  }

  leaveGroup(userId: string, groupId: string) {
    return GroupModel.findByIdAndUpdate(
      groupId,
      { $pull: { participantsId: userId } },
      // { new: true } // Optional: returns the updated document
    ).exec();
  }

  joinGroup({ groupId, usersId }: JoinGroupDto) {
    return GroupModel.findByIdAndUpdate(groupId, {
      $addToSet: { participantsId: { $each: usersId } },
    }).exec();
  }
}

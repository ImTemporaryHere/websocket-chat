import { GroupsRepository } from "./groups.repository";
import { CreateGroupInterface } from "./interfaces/create-group.interface";

export class GroupsService {
  constructor(private readonly groupsRepository: GroupsRepository) {}

  createGroup(params: CreateGroupInterface) {
    return this.groupsRepository.create(params);
  }

  removeGroup(groupName: string) {}

  leaveGroup(groupName: string) {}

  joinGroup() {}

  sendMessageToGroup(groupName: string, message: string) {}
}

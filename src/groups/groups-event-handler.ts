import { GroupsService } from "./groups.service";
import { CreateGroupInterface } from "./interfaces/create-group.interface";

export class GroupsEventHandler {
  constructor(private readonly groupsService: GroupsService) {}

  createGroup(params: CreateGroupInterface) {
    return this.groupsService.createGroup(params);
  }

  removeGroup(groupName: string) {}

  leaveGroup(groupName: string, userId: string) {}

  joinGroup() {}

  sendMessageToGroup(data: {
    groupName: string;
    message: string;
    userId: string;
  }) {}
}

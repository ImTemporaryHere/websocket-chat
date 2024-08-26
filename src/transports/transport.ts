import { JoinGroupDto } from "../groups/dto/join-group.dto";
import { GroupMessageInterface } from "../groups/interfaces/group-message.interface";

export interface Transport {
  notify(params: { topic: string; userId: string; message?: any }): void;
  createGroup(params: CreateGroupTransportParams): void;
  removeGroup(groupId: string): void;
  leaveGroup(userId: string, groupId: string): void;
  joinGroup(data: JoinGroupDto): void;
  sendMessageToGroup(data: GroupMessageInterface): void;
}

export interface CreateGroupTransportParams {
  groupId: string;
  participantsId: string[];
}

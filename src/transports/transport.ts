import { GroupMessageInterface } from "../groups/interfaces/group-message.interface";
import { TransportTopics } from "./transport-topics";

export interface Transport {
  notify(params: {
    topic: TransportTopics;
    userId: string;
    message?: any;
  }): void;
  createGroup(params: CreateGroupTransportParams): void;
  removeGroup(groupId: string): void;
  leaveGroup(userId: string, groupId: string): void;
  joinGroup(userId: string, groupId: string): void;
  sendMessageToGroup(data: GroupMessageInterface): void;
}

export interface CreateGroupTransportParams {
  groupId: string;
  participantsId: string[];
}

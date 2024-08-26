import { UserSocketsMapper } from "./sokets-mapper";
import { CreateGroupTransportParams, Transport } from "./transport";
import { container } from "../ioc-container/container";
import { JoinGroupDto } from "../groups/dto/join-group.dto";
import { GroupMessageInterface } from "../groups/interfaces/group-message.interface";

export class SocketIoTransport implements Transport {
  constructor(private readonly mapper: UserSocketsMapper) {}

  notify({
    topic,
    userId,
    message,
  }: {
    topic: string;
    userId: string;
    message?: any;
  }) {
    this.mapper.getSocket(userId).emit(topic, message);
  }

  createGroup({ groupId, participantsId }: CreateGroupTransportParams) {
    participantsId.forEach((userId) => {
      const socket = this.mapper.getSocket(userId);
      socket.join(groupId);
    });
  }
  removeGroup(groupId: string) {
    container.get("io").socketsLeave(groupId);
  }

  leaveGroup(userId: string, groupId: string) {
    this.mapper.getSocket(userId).leave(groupId);
    container
      .get("io")
      .to(groupId)
      .emit("userLeft", `User ${userId} left this group`);
  }

  joinGroup({ groupId, usersId }: JoinGroupDto) {
    usersId.forEach((userId) => {
      const socket = this.mapper.getSocket(userId).join(groupId);

      container
        .get("io")
        .to(groupId)
        .emit("userJoined", `User ${socket.id} joined ${groupId}`);
    });
  }
  sendMessageToGroup({ message, groupId, senderId }: GroupMessageInterface) {
    container.get("io").in(groupId).emit("groupMessage", {
      sender: senderId,
      message,
    });
  }
}

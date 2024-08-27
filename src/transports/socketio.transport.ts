import { UserSocketsMapper } from "./sokets-mapper";
import { CreateGroupTransportParams, Transport } from "./transport";
import { container } from "../ioc-container/container";
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
    const sockets = this.mapper.getSockets(userId);
    if (sockets) {
      sockets.forEach((socket) => socket.emit(topic, message));
    }
  }

  createGroup({ groupId, participantsId }: CreateGroupTransportParams) {
    console.log("participantsId", participantsId);
    participantsId.forEach((userId) => {
      const sockets = this.mapper.getSockets(userId);
      if (sockets) {
        sockets.forEach((socket) => {
          socket.join(groupId);
        });
      }
    });
  }
  removeGroup(groupId: string) {
    container.get("io").socketsLeave(groupId);
  }

  leaveGroup(userId: string, groupId: string) {
    this.mapper.getSockets(userId)?.forEach((s) => s.leave(groupId));
    container
      .get("io")
      .to(groupId)
      .emit("userLeft", `User ${userId} left this group`);
  }

  joinGroup(userId: string, groupId: string) {
    this.mapper.getSockets(userId)?.forEach((socket) => socket.join(groupId));

    container
      .get("io")
      .to(groupId)
      .emit("userJoined", `User ${userId} joined ${groupId}`);
  }
  sendMessageToGroup({ message, groupId, senderId }: GroupMessageInterface) {
    container.get("io").in(groupId).emit("group.message-sent.event", {
      sender: senderId,
      message,
    });
  }
}

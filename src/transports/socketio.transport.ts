import { Server } from "socket.io";
import { UserSocketsMapper } from "./sokets-mapper";
import { CreateGroupTransportParams, Transport } from "./transport";
import { GroupMessageInterface } from "../groups/interfaces/group-message.interface";
import { TransportTopics } from "./transport-topics";

export class SocketIoTransport implements Transport {
  constructor(
    private readonly mapper: UserSocketsMapper,
    private readonly io: Server,
  ) {}

  notify({
    topic,
    userId,
    message,
  }: {
    topic: TransportTopics;
    userId: string;
    message?: any;
  }) {
    const sockets = this.mapper.getSockets(userId);
    if (sockets) {
      sockets.forEach((socket) => socket.emit(topic, message));
    }
  }

  createGroup({ groupId, participantsId }: CreateGroupTransportParams) {
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
    this.io.socketsLeave(groupId);
  }

  leaveGroup(userId: string, groupId: string) {
    this.mapper.getSockets(userId)?.forEach((s) => s.leave(groupId));
    this.io.to(groupId).emit("userLeft", `User ${userId} left this group`);
  }

  joinGroup(userId: string, groupId: string) {
    this.mapper.getSockets(userId)?.forEach((socket) => socket.join(groupId));

    this.io.to(groupId).emit("userJoined", `User ${userId} joined ${groupId}`);
  }

  sendMessageToGroup(data: GroupMessageInterface) {
    this.io.in(data.groupId).emit(TransportTopics.groupMessageSent, data);
  }
}

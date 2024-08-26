import { Socket } from "socket.io";

export class UserSocketsMapper {
  private userSocketMap = new Map();

  addSocket(userId: string, socket: Socket) {
    this.userSocketMap.set(userId, socket);
  }

  getSocket(userId: string) {
    return this.userSocketMap.get(userId);
  }
}

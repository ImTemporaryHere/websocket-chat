import { Socket } from "socket.io";

export class UserSocketsMapper {
  private userSocketMap: Map<string, Socket[]> = new Map();

  addSocket(userId: string, socket: Socket) {
    const existingUserSockets = this.userSocketMap.get(userId);
    if (existingUserSockets) {
      existingUserSockets.push(socket);
    } else {
      this.userSocketMap.set(userId, [socket]);
    }
  }

  getSockets(userId: string) {
    return this.userSocketMap.get(userId);
  }
}

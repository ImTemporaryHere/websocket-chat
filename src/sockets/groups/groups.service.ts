import { Server, Socket } from "socket.io";
import { IoServer } from "../server";

export class GroupsService {
  static createGroup(groupName: string) {
    console.log(`group ${groupName} created`);
  }

  static removeGroup(groupName: string) {
    IoServer.io.socketsLeave(groupName);
  }

  static leaveGroup(socket: Socket, groupName: string) {
    socket.leave(groupName);
    console.log(`User ${socket.id} left room ${groupName}`);
    IoServer.io
      .to(groupName)
      .emit("userLeft", `User ${socket.id} left ${groupName}`);
  }

  static joinGroup(socket: Socket, groupName: string) {
    socket.join(groupName);
    console.log(`User ${socket.id} joined room ${groupName}`);
    IoServer.io
      .to(groupName)
      .emit("userJoined", `User ${socket.id} joined ${groupName}`);
  }

  static sendMessageToGroup(
    socket: Socket,
    groupName: string,
    message: string,
  ) {
    IoServer.io.in(groupName).emit("groupMessage", {
      sender: socket.id,
      message,
    });
  }
}

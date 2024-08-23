import { Server as IoServer, Socket } from "socket.io";
import { GroupsEventHandler } from "../groups/groups-event-handler";

export class SocketIoTransport {
  io!: IoServer;

  constructor(private readonly groupsEventHandler: GroupsEventHandler) {}

  setupServer(io: IoServer) {
    this.io = io;
    this.io.on("connection", this.registerHandlers.bind(this));
  }

  private registerHandlers(socket: Socket) {
    socket.on("createGroup", async (userId: string, groupName: string) => {
      await this.createGroup(userId, groupName, socket);
    });

    socket.on("removeGroup", (groupName: string) => {
      this.removeGroup(groupName);
    });

    socket.on("leaveGroup", (groupName: string) => {
      this.leaveGroup(socket, groupName);
    });

    socket.on("joinGroup", (groupName: string) => {
      this.joinGroup(socket, groupName);
    });

    socket.on("groupMessage", (groupName: string, message: string) => {
      this.sendMessageToGroup(socket, groupName, message);
    });
  }

  async createGroup(ownerId: string, name: string, socket: Socket) {
    const newGroup = await this.groupsEventHandler.createGroup({
      ownerId,
      name,
      participantsId: [ownerId],
    });
    socket.emit("groupCreated", newGroup);
  }

  removeGroup(groupName: string) {
    this.io.socketsLeave(groupName);
    this.groupsEventHandler.removeGroup(groupName);
  }

  leaveGroup(socket: Socket, groupName: string) {
    socket.leave(groupName);
    console.log(`User ${socket.id} left room ${groupName}`);
    this.io
      .to(groupName)
      .emit("userLeft", `User ${socket.id} left ${groupName}`);
    this.groupsEventHandler.leaveGroup(groupName, socket.id); //todo user id from db
  }

  //responsibility

  joinGroup(socket: Socket, groupName: string) {
    socket.join(groupName);
    console.log(`User ${socket.id} joined room ${groupName}`);
    this.io
      .to(groupName)
      .emit("userJoined", `User ${socket.id} joined ${groupName}`);
    this.groupsEventHandler.joinGroup(); //todo user id from db
  }

  sendMessageToGroup(socket: Socket, groupName: string, message: string) {
    this.io.in(groupName).emit("groupMessage", {
      sender: socket.id,
      message,
    });
    this.groupsEventHandler.sendMessageToGroup({
      groupName,
      message,
      userId: socket.id,
    }); //todo user id from db
  }
}

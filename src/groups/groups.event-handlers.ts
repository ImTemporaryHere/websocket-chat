import { Server as IoServer, Socket } from "socket.io";
import { container } from "../ioc-container/container";
import { CreateGroupDto } from "./dto/create-group.dto";
import { SendGroupMessageDto } from "./dto/send-group-message.dto";

export function registerGroupHandlers(socket: Socket) {
  socket.on("group.create.command", async (data: CreateGroupDto) => {
    await container.get("GroupsController").createGroup(socket, data);
  });

  socket.on("group.remove.command", async (groupId: string) => {
    await container.get("GroupsController").removeGroup(socket, groupId);
  });

  socket.on("group.leave.command", async (groupId: string) => {
    await container.get("GroupsController").leaveGroup(socket, groupId);
  });

  socket.on("group.join.command", async (groupId: string) => {
    await container.get("GroupsController").joinGroup(socket, groupId);
  });

  socket.on("group.send-message.command", async (data: SendGroupMessageDto) => {
    await container.get("GroupsController").sendMessageToGroup(socket, data);
  });
}

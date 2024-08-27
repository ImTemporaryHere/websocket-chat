import { Socket } from "socket.io";
import { CreateGroupDto } from "./dto/create-group.dto";
import { SendGroupMessageDto } from "./dto/send-group-message.dto";
import { GroupsController } from "./groups.controller";

export function registerGroupHandlers(
  socket: Socket,
  groupsController: GroupsController,
) {
  socket.on("group.create.command", async (data: CreateGroupDto) => {
    await groupsController.createGroup(socket, data);
  });

  socket.on("group.remove.command", async (groupId: string) => {
    await groupsController.removeGroup(socket, groupId);
  });

  socket.on("group.leave.command", async (groupId: string) => {
    await groupsController.leaveGroup(socket, groupId);
  });

  socket.on("group.join.command", async (groupId: string) => {
    await groupsController.joinGroup(socket, groupId);
  });

  socket.on("group.send-message.command", async (data: SendGroupMessageDto) => {
    await groupsController.sendMessageToGroup(socket, data);
  });
}

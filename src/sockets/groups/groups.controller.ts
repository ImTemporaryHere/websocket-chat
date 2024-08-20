import { Server, Socket } from "socket.io";
import { GroupsService } from "./groups.service";

export class GroupsController {
  static registerGroupsHandlers(socket: Socket) {
    socket.on("createGroup", (groupName: string) => {
      GroupsService.createGroup(groupName);
    });

    socket.on("removeGroup", (groupName: string) => {
      GroupsService.removeGroup(groupName);
    });

    socket.on("leaveGroup", (groupName: string) => {
      GroupsService.leaveGroup(socket, groupName);
    });

    socket.on("joinGroup", (groupName: string) => {
      GroupsService.joinGroup(socket, groupName);
    });

    socket.on("groupMessage", (groupName: string, message: string) => {
      GroupsService.sendMessageToGroup(socket, groupName, message);
    });
  }
}

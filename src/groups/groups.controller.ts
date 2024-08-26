import { GroupsService } from "./groups.service";
import { Socket } from "socket.io";
import { CreateGroupDto } from "./dto/create-group.dto";
import { JoinGroupDto } from "./dto/join-group.dto";
import { SendGroupMessageDto } from "./dto/send-group-message.dto";

const mockUserId = "66bcf5485cbc0fec59d792e1";

export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  async createGroup(socket: Socket, { participantsId, name }: CreateGroupDto) {
    try {
      await this.groupsService.createGroup({
        ownerId: mockUserId, // todo  extract owner id from request
        name,
        participantsId,
      });
    } catch (e) {
      socket.emit("group.create.error", e);
    }
  }

  async removeGroup(socket: Socket, groupId: string) {
    try {
      await this.groupsService.removeGroup("66bcf5485cbc0fec59d792e1", groupId);
    } catch (e) {
      socket.emit("group.remove.error", e);
    }
  }

  async leaveGroup(socket: Socket, groupId: string) {
    try {
      // todo  extract user id from socket/request
      await this.groupsService.leaveGroup(mockUserId, groupId);
    } catch (e) {
      socket.emit("group.leave.error", e);
    }
  }

  async joinGroup(socket: Socket, data: JoinGroupDto) {
    try {
      await this.groupsService.joinGroup(data);
    } catch (e) {
      socket.emit("group.join.error", e);
    }
  }

  async sendMessageToGroup(socket: Socket, data: SendGroupMessageDto) {
    try {
      // todo  extract user id from socket/request
      await this.groupsService.sendMessageToGroup({
        ...data,
        senderId: mockUserId,
      });
    } catch (e) {
      socket.emit("group.send-message.command", e);
    }
  }
}

import { GroupsRepository } from "./groups.repository";
import { ICreateGroup } from "./interfaces/create-group.interface";
import { Transport } from "../transports/transport";
import { JoinGroupDto } from "./dto/join-group.dto";
import { GroupMessageInterface } from "./interfaces/group-message.interface";

export class GroupsService {
  constructor(
    private readonly groupsRepository: GroupsRepository,
    private readonly transport: Transport,
  ) {}

  async createGroup(params: ICreateGroup) {
    const createdGroup = await this.groupsRepository.create(params);

    this.transport.createGroup({
      groupId: createdGroup._id.toString(),
      participantsId: params.participantsId,
    });

    this.transport.notify({
      topic: "group.created.event",
      userId: params.ownerId,
      message: createdGroup._id,
    });
  }

  async removeGroup(currentUserId: string, groupId: string) {
    //todo : can add validation whether user owns group or not
    this.transport.removeGroup(groupId);
    await this.groupsRepository.remove(groupId);
    this.transport.notify({
      topic: "group.removed.event",
      userId: currentUserId,
      message: groupId,
    });
  }

  async leaveGroup(userId: string, groupId: string) {
    this.transport.leaveGroup(userId, groupId);
    await this.groupsRepository.leaveGroup(userId, groupId);
  }

  async joinGroup(data: JoinGroupDto) {
    this.transport.joinGroup(data);
    await this.groupsRepository.joinGroup(data);
  }

  async sendMessageToGroup(data: GroupMessageInterface) {
    this.transport.sendMessageToGroup(data);
    //use repository for updating group history
  }
}

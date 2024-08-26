import { Server as IoServer } from "socket.io";
import { UsersRepository } from "../users/users.repository";
import { AuthService } from "../users/auth.service";
import { UsersService } from "../users/users.service";
import { GroupsRepository } from "../groups/groups.repository";
import { GroupsService } from "../groups/groups.service";
import { GroupsController } from "../groups/groups.controller";
import { SocketIoTransport } from "../transports/socketio.transport";
import { UserSocketsMapper } from "../transports/sokets-mapper";

export type ServiceTypes = {
  io: IoServer;
  UsersRepository: UsersRepository;
  AuthService: AuthService;
  UsersService: UsersService;
  GroupsRepository: GroupsRepository;
  GroupsService: GroupsService;
  GroupsController: GroupsController;
  SocketIoTransport: SocketIoTransport;
  SocketsMapper: UserSocketsMapper;
  Transport: SocketIoTransport;
};

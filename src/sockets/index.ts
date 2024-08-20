import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { GroupsController } from "./groups/groups.controller";
import { IoServer } from "./server";

export function setupIoServer(appServer: HttpServer) {
  const io = new Server(appServer);
  IoServer.io = io;
  io.on("connection", onConnectionHandler);
}

function onConnectionHandler(socket: Socket) {
  GroupsController.registerGroupsHandlers(socket);
}

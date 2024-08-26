import { Server } from "socket.io";
import { container } from "../ioc-container/container";
type IoMiddleware = Parameters<Server["use"]>[0];

export const socketIoUserMapperMiddleware: IoMiddleware = (socket, next) => {
  container.get("SocketsMapper").addSocket(socket.user.userId, socket);

  next();
};

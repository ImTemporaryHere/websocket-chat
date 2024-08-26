import { Server } from "socket.io";
import { container } from "../ioc-container/container";
import { TokenPayload } from "../users/auth.service";
type IoMiddleware = Parameters<Server["use"]>[0];

declare module "socket.io" {
  interface Socket {
    user: TokenPayload;
  }
}

export const authSocketMiddleware: IoMiddleware = (socket, next) => {
  const accessToken = socket.handshake.headers.access_token as string;
  if (!accessToken) {
    return next(new Error("not authorized"));
  }

  const userData = container.get("AuthService").verifyAccessToken(accessToken);

  if (!userData) {
    return next(new Error("not authorized"));
  }
  socket["user"] = userData as TokenPayload;
  next();
};

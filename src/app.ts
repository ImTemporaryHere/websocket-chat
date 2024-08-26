// src/index.js
import express, { Express, Request, Response } from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import { routers } from "./routers";
import { errorMiddleware } from "./middlewares/error-middleware";
import { createServer } from "http";
import { container } from "./ioc-container/container";
import { UsersService } from "./users/users.service";
import { UsersRepository } from "./users/users.repository";
import { AuthService } from "./users/auth.service";
import { SocketIoTransport } from "./transports/socketio.transport";
import { GroupsController } from "./groups/groups.controller";
import { GroupsService } from "./groups/groups.service";
import { GroupsRepository } from "./groups/groups.repository";
import { Server as IoServer, Socket } from "socket.io";
import { registerGroupHandlers } from "./groups/groups.event-handlers";
import { UserSocketsMapper } from "./transports/sokets-mapper";
import { authSocketMiddleware } from "./middlewares/socketio-auth-middleware";
import { socketIoUserMapperMiddleware } from "./middlewares/socketio-user-mapper-middleware";

export async function runApp() {
  const app: Express = express();
  const port = process.env.PORT || 3000;
  const expressServer = createServer(app);
  const io = new IoServer(expressServer);
  container.register("io", () => io);
  io.use(authSocketMiddleware);
  io.use(socketIoUserMapperMiddleware);
  io.on("connection", registerHandlers);

  container.register("UsersRepository", UsersRepository);
  container.register("AuthService", AuthService);
  container.register("UsersService", UsersService, [
    "AuthService",
    "UsersRepository",
  ]);

  container.register("GroupsRepository", GroupsRepository);
  container.register("SocketsMapper", UserSocketsMapper);
  container.register("Transport", SocketIoTransport, ["SocketsMapper"]);
  container.register("GroupsService", GroupsService, [
    "GroupsRepository",
    "Transport",
  ]);
  container.register("GroupsController", GroupsController, ["GroupsService"]);

  // Middleware to parse JSON requests
  app.use(express.json());
  app.use(cookieParser());
  app.use(cors());
  app.use("/api", routers);
  app.use(errorMiddleware);

  mongoose.connection.on("error", (err: any) => {
    console.error("Failed to connect to MongoDB", err);
  });

  // MongoDB Connection URI
  const mongoURI = process.env.MONGODB_URI as string;

  // Connect to MongoDB using Mongoose
  await mongoose.connect(mongoURI);

  console.log("Connected to MongoDB");

  expressServer.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });

  function registerHandlers(socket: Socket) {
    registerGroupHandlers(socket);
  }
}

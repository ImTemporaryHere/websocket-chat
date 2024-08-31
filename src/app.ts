// src/index.js
import express, { Express, Request, Response } from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorMiddleware } from "./middlewares/error-middleware";
import { createServer } from "http";
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
import { getAuthSocketMiddleware } from "./middlewares/socketio-auth-middleware";
import { getSocketIoUserMapperMiddleware } from "./middlewares/socketio-user-mapper-middleware";
import { IocContainer } from "./ioc-container/container";
import { UserController } from "./users/users.controller";
import { UsersRouter } from "./users/users.router";

export async function runApp() {
  const container = IocContainer.getInstance();

  const app: Express = express();
  const port = process.env.PORT || 3000;
  const httpServer = createServer(app);
  const io = new IoServer(httpServer);

  container.register("UsersRepository", UsersRepository);
  container.register("AuthService", AuthService);
  container.register("UsersService", UsersService, [
    "AuthService",
    "UsersRepository",
  ]);
  container.register("UserController", UserController, ["UsersService"]);
  //groups
  container.register("io", () => io);
  container.register("GroupsRepository", GroupsRepository);
  container.register("UserSocketsMapper", UserSocketsMapper);
  container.register("Transport", SocketIoTransport, [
    "UserSocketsMapper",
    "io",
  ]);
  container.register("GroupsService", GroupsService, [
    "GroupsRepository",
    "Transport",
  ]);
  container.register("GroupsController", GroupsController, ["GroupsService"]);

  io.use(getAuthSocketMiddleware(container.get("AuthService")));
  io.use(getSocketIoUserMapperMiddleware(container.get("UserSocketsMapper")));
  io.on("connection", registerHandlers);

  // Middleware to parse JSON requests
  app.use(express.json());
  app.use(cookieParser());
  app.use(cors());
  app.use("/api", [
    UsersRouter(container.get("UserController"), container.get("AuthService")),
  ]);
  app.use(errorMiddleware);

  mongoose.connection.on("error", (err: any) => {
    console.error("Failed to connect to MongoDB", err);
  });

  // MongoDB Connection URI
  const mongoURI = process.env.MONGODB_URI as string;
  console.log("mongo", mongoURI);
  // Connect to MongoDB using Mongoose
  await mongoose.connect(mongoURI);

  console.log("Connected to MongoDB");

  httpServer.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });

  process.on("SIGTERM", async () => {
    console.log("SIGTERM signal received: closing HTTP server");
    await stopService();
  });

  return stopService;

  async function stopService() {
    await new Promise((resolve, reject) => {
      io.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve(0);
        }
      });
    });
    console.log("io server closed");

    await mongoose.connection.close();
    console.log("db connection closed");
    process.exit(0);
  }

  function registerHandlers(socket: Socket) {
    registerGroupHandlers(socket, container.get("GroupsController"));
  }
}

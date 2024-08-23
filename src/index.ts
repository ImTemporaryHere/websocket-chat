// src/index.js
import express, { Express, Request, Response } from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import { routers } from "./routers";
import { errorMiddleware } from "./middlewares/error-middleware";
import { createServer } from "http";
import { container } from "./container";
import { UsersService } from "./users/users.service";
import { UsersRepository } from "./users/users.repository";
import { AuthService } from "./users/auth.service";
import { SocketIoTransport } from "./transports/socketio.transport";
import { GroupsEventHandler } from "./groups/groups-event-handler";
import { GroupsService } from "./groups/groups.service";
import { GroupsRepository } from "./groups/groups.repository";

container.register(UsersRepository, []);
container.register(AuthService, []);
container.register(UsersService, [AuthService, UsersRepository]);

container.register(GroupsRepository, []);
container.register(GroupsService, [GroupsRepository]);
container.register(GroupsEventHandler, [GroupsService]);
container.register(SocketIoTransport, [GroupsEventHandler]);

const app: Express = express();
const port = process.env.PORT || 3000;
const expressServer = createServer(app);
container.get(SocketIoTransport).setupServer(expressServer);

// Middleware to parse JSON requests
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use("/api", routers);
app.use(errorMiddleware);

// MongoDB Connection URI
const mongoURI = process.env.MONGODB_URI as string;

// Connect to MongoDB using Mongoose
mongoose.connect(mongoURI);

// Connection Events
mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");

  expressServer.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
});

mongoose.connection.on("error", (err: any) => {
  console.error("Failed to connect to MongoDB", err);
});

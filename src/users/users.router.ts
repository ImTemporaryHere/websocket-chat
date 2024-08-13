import express, { Router } from "express";
import { UsersController } from "./users.controller";

export const usersRouter = express.Router();

usersRouter.post("/", UsersController.createUser);
usersRouter.get("/", UsersController.getUsers);

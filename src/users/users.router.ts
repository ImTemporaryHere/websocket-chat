import express, { Router } from "express";
import { UsersController } from "./users.controller";
import { authMiddleware } from "../middlewares/auth-middleware";
import { body } from "express-validator";

export const usersRouter = express.Router({ mergeParams: true });

usersRouter
  .post(
    "/users",
    body("email").isEmail(),
    body("password").isLength({ min: 3, max: 20 }),
    UsersController.createUser,
  )
  .get("/users", authMiddleware, UsersController.getUsers)
  .post(
    "/login",
    body("email").isEmail(),
    body("password").isLength({ min: 3, max: 20 }),
    UsersController.login,
  );

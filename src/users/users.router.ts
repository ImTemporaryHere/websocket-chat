import express, { Router } from "express";
import { createUser, getUsers, login } from "./users.controller";
import { authMiddleware } from "../middlewares/auth-middleware";
import { body } from "express-validator";
import { container } from "../ioc-container/container";

export const usersRouter = express.Router({ mergeParams: true });

usersRouter
  .post(
    "/users",
    body("email").isEmail(),
    body("password").isLength({ min: 3, max: 20 }),
    createUser,
  )
  .get("/users", authMiddleware, getUsers)
  .post(
    "/login",
    body("email").isEmail(),
    body("password").isLength({ min: 3, max: 20 }),
    login,
  );

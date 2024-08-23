import { NextFunction, Request, Response } from "express";
import { UsersService } from "./users.service";
import { validationResult } from "express-validator";
import { ApiException } from "../exeptions/api-exception";
import { container } from "../container";

export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        ApiException.badRequestError("validation errors", errors.array()),
      );
    }

    const { userId, accessToken, refreshToken } = await container
      .get(UsersService)
      .registerUser(req.body);
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ userId, accessToken });
  } catch (e) {
    next(e);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return next(
        ApiException.badRequestError("validation errors", errors.array()),
      );
    }

    const { userId, accessToken, refreshToken } = await container
      .get(UsersService)
      .login(req.body);
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ userId, accessToken });
  } catch (e) {
    next(e);
  }
}

export async function getUsers(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // Handle get users logic here
    const users = await container.get(UsersService).getUsers();
    res.send(users);
  } catch (e) {
    next(e);
  }
}

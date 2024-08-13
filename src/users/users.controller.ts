import { Request, Response } from "express";
import { UsersService } from "./users.service";

export class UsersController {
  static async createUser(req: Request, res: Response) {
    const { userId, accessToken } = await UsersService.registerUser(req.body);
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.json({ userId });
  }

  static async getUsers(req: Request, res: Response) {
    // Handle get users logic here
    const users = await UsersService.getUsers();
    res.send(users);
  }
}

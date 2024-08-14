import { UsersRepository } from "./users.repository";
import { User } from "./user.model";
import { AuthService } from "./auth.service";
import { ApiException } from "../exeptions/api-exception";

export class UsersService {
  static async registerUser(user: User): Promise<{
    accessToken: string;
    userId: string;
    refreshToken: string;
  }> {
    const hashedPassword = await AuthService.hashPassword(user.password);

    const createdUser = await UsersRepository.create({
      ...user,
      password: hashedPassword,
    });

    const { accessToken, refreshToken } = AuthService.generateTokens({
      userId: createdUser._id.toString(),
    });

    return {
      accessToken,
      refreshToken,
      userId: createdUser._id.toString(),
    };
  }

  static async login(userData: User) {
    const existingUser = await UsersRepository.findOne({
      email: userData.email,
    });

    if (!existingUser) {
      throw ApiException.badRequestError("no existingUser with this email");
    }

    const checkPassword = AuthService.verifyPassword(
      userData.password,
      existingUser.password,
    );

    if (!checkPassword) {
      throw ApiException.badRequestError("not correct password");
    }

    const { accessToken, refreshToken } = AuthService.generateTokens({
      userId: existingUser._id.toString(),
    });

    return {
      accessToken,
      refreshToken,
      userId: existingUser._id.toString(),
    };
  }

  static getUsers() {
    return UsersRepository.find();
  }
}

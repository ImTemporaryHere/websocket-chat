import { UsersRepository } from "./users.repository";
import { User } from "./user.model";
import { AuthService } from "./auth.service";

export class UsersService {
  static async registerUser(user: User): Promise<{
    accessToken: string;
    userId: string;
  }> {
    const hashedPassword = await AuthService.hashPassword(user.password);

    const createdUser = await UsersRepository.create({
      ...user,
      password: hashedPassword,
    });

    const { accessToken } = AuthService.generateTokens({
      userId: createdUser._id.toString(),
    });

    return {
      accessToken: accessToken,
      userId: createdUser._id.toString(),
    };
  }

  static getUsers() {
    return UsersRepository.find();
  }
}

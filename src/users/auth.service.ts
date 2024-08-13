import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const saltRounds = 10;

export type TokenPayload = {
  userId: string;
};

export class AuthService {
  static hashPassword(password: string) {
    return bcrypt.hash(password, saltRounds);
  }

  static verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateTokens(payload: TokenPayload) {
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_ACCESS_SECRET as string,
      {
        expiresIn: "30m",
      },
    );

    return { accessToken };
  }
}

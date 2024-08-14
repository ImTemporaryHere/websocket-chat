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

    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET as string,
      {
        expiresIn: "7d",
      },
    );

    return { accessToken, refreshToken };
  }

  static verifyAccessToken(token: string) {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET as string);
  }

  static verifyRefreshToken(token: string) {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET as string);
  }
}

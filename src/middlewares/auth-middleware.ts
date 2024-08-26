import { NextFunction, Request, Response } from "express";
import { ApiException } from "../exeptions/api-exception";
import { AuthService, TokenPayload } from "../users/auth.service";
import { container } from "../ioc-container/container";

declare module "express-serve-static-core" {
  interface Request {
    user?: TokenPayload;
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const accessToken = req.headers.authorization?.split(" ")[1];

    if (!accessToken) {
      return next(ApiException.unauthorizedError());
    }

    const userData = container
      .get("AuthService")
      .verifyAccessToken(accessToken);

    if (!userData) {
      return next(ApiException.unauthorizedError());
    }
    req["user"] = userData as TokenPayload;
    next();
  } catch (e) {
    return next(ApiException.unauthorizedError());
  }
};

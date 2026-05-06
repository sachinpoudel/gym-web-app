import { NextFunction, Request, Response } from "express";
import { UserRole } from "@prisma/client";
import { authService } from "../services/auth.service";
import { verifyToken } from "../utils/jwt";
import { HttpError } from "../utils/httpError";

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new HttpError(401, "Authorization token missing or invalid");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new HttpError(401, "Authorization token missing or invalid");
    }

    const payload = verifyToken(token);
    const user = await authService.getUserById(payload.userId);

    if (!user) {
      throw new HttpError(401, "User not found");
    }

    req.user = {
      id: user.id,
      role: user.role as UserRole
    };

    next();
  } catch (error) {
    next(error);
  }
};

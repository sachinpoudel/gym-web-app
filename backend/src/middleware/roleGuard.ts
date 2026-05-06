import { NextFunction, Request, Response } from "express";
import { UserRole } from "@prisma/client";
import { HttpError } from "../utils/httpError";

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new HttpError(401, "Unauthorized");
    }

    if (!roles.includes(req.user.role)) {
      throw new HttpError(403, "Forbidden");
    }

    next();
  };
};

export const requireAdmin = authorize(UserRole.ADMIN);

export const requireMember = authorize(UserRole.MEMBER, UserRole.ADMIN);

export const requireTrainer = authorize(UserRole.TRAINER, UserRole.ADMIN);

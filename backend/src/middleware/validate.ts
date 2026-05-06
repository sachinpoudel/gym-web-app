import { NextFunction, Request, Response } from "express";
import { ZodError, ZodTypeAny } from "zod";
import { HttpError } from "../utils/httpError";

export const requireFields = (fields: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const missing = fields.filter((field) => req.body[field] === undefined || req.body[field] === null || req.body[field] === "");
    if (missing.length > 0) {
      throw new HttpError(400, `Missing required fields: ${missing.join(", ")}`);
    }
    next();
  };
};

export const validateBody = (schema: ZodTypeAny) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }));

        throw new HttpError(400, `Validation failed: ${JSON.stringify(issues)}`);
      }

      throw error;
    }
  };
};

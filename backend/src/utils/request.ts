import { Request } from "express";
import { HttpError } from "./httpError";

export const getRequiredParam = (req: Request, key: string): string => {
  const value = req.params[key];

  if (!value || Array.isArray(value)) {
    throw new HttpError(400, `Missing or invalid URL parameter: ${key}`);
  }

  return value;
};

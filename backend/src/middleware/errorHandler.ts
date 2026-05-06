import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { HttpError } from "../utils/httpError";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      statusCode: err.statusCode
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const statusCode = 409;
      return res.status(statusCode).json({
        success: false,
        message: "Unique constraint failed",
        statusCode
      });
    }

    if (err.code === "P2025") {
      const statusCode = 404;
      return res.status(statusCode).json({
        success: false,
        message: "Record not found",
        statusCode
      });
    }

    const statusCode = 400;
    return res.status(statusCode).json({
      success: false,
      message: `Database error: ${err.code}`,
      statusCode
    });
  }

  const statusCode = 500;
  return res.status(statusCode).json({
    success: false,
    message: "Internal server error",
    statusCode
  });
};

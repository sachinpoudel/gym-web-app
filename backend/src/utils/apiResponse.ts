import { Response } from "express";

export const success = <T>(
  res: Response,
  data: T,
  message = "OK",
  statusCode = 200
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const error = (
  res: Response,
  message: string,
  statusCode = 400
): Response => {
  return res.status(statusCode).json({
    success: false,
    message
  });
};

export const sendSuccess = success;

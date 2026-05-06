import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export interface JwtPayload {
  userId: string;
  role: string;
}

export const generateToken = (userId: string, role: string): string => {
  return signToken({ userId, role });
};

export const signToken = (payload: JwtPayload): string => {
  const expiresIn = env.jwtExpiresIn as SignOptions["expiresIn"] | undefined;
  const options: SignOptions = expiresIn ? { expiresIn } : {};

  return jwt.sign(payload, env.jwtSecret, options);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
};

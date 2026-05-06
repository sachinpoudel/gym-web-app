import dotenv from "dotenv";

dotenv.config();

const getEnv = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 5000),
  databaseUrl: getEnv("DATABASE_URL"),
  jwtSecret: getEnv("JWT_SECRET", "change_me_in_production"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
 clientUrl: getEnv("CLIENT_URL"),
};

export const isProduction = env.nodeEnv === "production";

import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export const hashPassword = async (plainText: string): Promise<string> => {
  return bcrypt.hash(plainText, SALT_ROUNDS);
};

export const comparePassword = async (
  plainText: string,
  hashedValue: string
): Promise<boolean> => {
  return bcrypt.compare(plainText, hashedValue);
};

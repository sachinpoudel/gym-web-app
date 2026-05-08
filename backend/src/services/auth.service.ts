import { UserRole } from "@prisma/client";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { comparePassword, hashPassword } from "../utils/password";
import { HttpError } from "../utils/httpError";

interface RegisterInput {
  email: string;
  password: string;
}

export const authService = {
  async register({ email, password }: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      include: {
        member: true
      }
    });

    if (!existing || !existing.member) {
      throw new HttpError(404, "Email not found in admitted gym members");
    }

    if (existing.role !== UserRole.MEMBER) {
      throw new HttpError(403, "Only member accounts can be registered from this form");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.update({
      where: { id: existing.id },
      data: {
        email: normalizedEmail,
        password: hashedPassword
      },
      include: {
        member: true
      }
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      member: user.member
    };
  },

  async login(email: string, password: string) {
    const start = Date.now();
    const lookupStart = Date.now();
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        member: true,
        
      }
    });
    const lookupMs = Date.now() - lookupStart;

    if (!user) {
      throw new HttpError(401, "Invalid credentials");
    }

    const compareStart = Date.now();
    const isPasswordValid = await comparePassword(password, user.password);
    const compareMs = Date.now() - compareStart;
    if (!isPasswordValid) {
      throw new HttpError(401, "Invalid credentials");
    }

    if (env.nodeEnv !== "production") {
      const totalMs = Date.now() - start;
      console.info(
        `[auth.login] lookup=${lookupMs}ms compare=${compareMs}ms total=${totalMs}ms`
      );
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      member: user.member,
    
    };
  },

  
  logout() {
    return {
      success: true
    };
  },

  forgotPassword() {
    return {
      success: true
    };
  },

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        member: true,
        trainer: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user?.member) {
      return user;
    }

    const daysLeft = Math.max(
      0,
      Math.ceil(
        (user.member.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    );

    return {
      ...user,
      member: {
        ...user.member,
        daysLeft
      }
    };
  }
};

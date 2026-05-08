import { Request, Response } from "express";
import { env } from "../config/env";
import { authService } from "../services/auth.service";
import { sendSuccess } from "../utils/apiResponse";
import { signToken } from "../utils/jwt";
import { HttpError } from "../utils/httpError";

export const authController = {
  async register(req: Request, res: Response) {
    const { email, password } = req.body;
    const payload = await authService.register({
      email,
      password
    });
    const token = signToken({ userId: payload.user.id, role: payload.user.role });

    return sendSuccess(
      res,
      {
        token,
        user: payload.user,
        member: payload.member
      },
      "Registered successfully",
      201
    );
  },

  async login(req: Request, res: Response) {
    const start = Date.now();
    const { email, password } = req.body;
    const user = await authService.login(email, password);
    const token = signToken({ userId: user.id, role: user.role });

    if (env.nodeEnv !== "production") {
      const totalMs = Date.now() - start;
      console.info(`[auth.login] controller total=${totalMs}ms`);
    }

    return sendSuccess(res, { token, user }, "Login successful");
  },

  async logout(_req: Request, res: Response) {
    await authService.logout();
    return sendSuccess(res, null, "Logged out successfully");
  },

  async forgotPassword(_req: Request, res: Response) {
    await authService.forgotPassword();
    return sendSuccess(res, null, "Password reset request accepted");
  },

  async me(req: Request, res: Response) {
    if (!req.user) {
      throw new HttpError(401, "Unauthorized");
    }

    const user = await authService.getUserById(req.user.id);
    return sendSuccess(res, user, "Current user");
  }
};

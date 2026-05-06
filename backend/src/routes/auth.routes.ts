import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { requireFields } from "../middleware/validate";

const router = Router();

router.post(
  "/register",
  requireFields(["email", "password"]),
  asyncHandler(authController.register)
);
router.post(
  "/login",
  requireFields(["email", "password"]),
  asyncHandler(authController.login)
);
router.post("/logout", authenticate, asyncHandler(authController.logout));
router.post("/forgot-password", asyncHandler(authController.forgotPassword));
router.get("/me", authenticate, asyncHandler(authController.me));

export default router;

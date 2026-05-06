import { UserRole } from "@prisma/client";
import { Router } from "express";
import { paymentController } from "../controllers/payment.controller";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/roleGuard";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(authenticate);
router.get("/", authorize(UserRole.ADMIN, UserRole.FRONT_DESK), asyncHandler(paymentController.getAll));
router.get("/summary", authorize(UserRole.ADMIN, UserRole.FRONT_DESK), asyncHandler(paymentController.getSummary));
router.get("/monthly", authorize(UserRole.ADMIN, UserRole.FRONT_DESK), asyncHandler(paymentController.getMonthly));
router.get("/yearly", authorize(UserRole.ADMIN, UserRole.FRONT_DESK), asyncHandler(paymentController.getYearly));
router.get("/overdue", authorize(UserRole.ADMIN, UserRole.FRONT_DESK), asyncHandler(paymentController.getOverdue));
router.get("/member/:memberId", authorize(UserRole.ADMIN, UserRole.FRONT_DESK, UserRole.MEMBER), asyncHandler(paymentController.getByMemberId));
router.post("/", authorize(UserRole.ADMIN, UserRole.FRONT_DESK), asyncHandler(paymentController.create));
router.patch("/:id/status", authorize(UserRole.ADMIN, UserRole.FRONT_DESK), asyncHandler(paymentController.updateStatus));
router.patch("/:id/paid", authorize(UserRole.ADMIN, UserRole.FRONT_DESK), asyncHandler(paymentController.markPaid));
router.post("/:id/reminder", authorize(UserRole.ADMIN, UserRole.FRONT_DESK), asyncHandler(paymentController.sendReminder));

export default router;

import { Router } from "express";
import { reportsController } from "../controllers/reports.controller";
import { authenticate } from "../middleware/auth";
import { requireAdmin } from "../middleware/roleGuard";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(authenticate, requireAdmin);
router.get("/overview", asyncHandler(reportsController.overview));
router.get("/revenue", asyncHandler(reportsController.revenue));
router.get("/attendance", asyncHandler(reportsController.attendance));
router.get("/retention", asyncHandler(reportsController.retention));

export default router;

import { Router } from "express";
import { memberController } from "../controllers/member.controller";
import { authenticate } from "../middleware/auth";
import { requireAdmin } from "../middleware/roleGuard";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(authenticate);

router.get("/", requireAdmin, asyncHandler(memberController.getAll));
router.get("/expiring", requireAdmin, asyncHandler(memberController.getExpiring));
router.get("/:id/stats", requireAdmin, asyncHandler(memberController.getStats));
router.get("/:id", requireAdmin, asyncHandler(memberController.getById));
router.post("/create", requireAdmin, asyncHandler(memberController.create));
router.put("/:id", requireAdmin, asyncHandler(memberController.update));
router.delete("/:id", requireAdmin, asyncHandler(memberController.remove));
router.patch("/:id/freeze", requireAdmin, asyncHandler(memberController.freeze));
router.patch("/:id/activate", requireAdmin, asyncHandler(memberController.activate));

export default router;

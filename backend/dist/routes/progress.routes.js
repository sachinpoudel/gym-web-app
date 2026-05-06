"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
const progress_controller_1 = require("../controllers/progress.controller");
const auth_1 = require("../middleware/auth");
const roleGuard_1 = require("../middleware/roleGuard");
const asyncHandler_1 = require("../utils/asyncHandler");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get("/:memberId", (0, roleGuard_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.TRAINER, client_1.UserRole.MEMBER), (0, asyncHandler_1.asyncHandler)(progress_controller_1.progressController.getByMemberId));
router.get("/member/:memberId", (0, roleGuard_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.TRAINER, client_1.UserRole.MEMBER), (0, asyncHandler_1.asyncHandler)(progress_controller_1.progressController.getByMemberId));
router.post("/", (0, roleGuard_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.TRAINER), (0, asyncHandler_1.asyncHandler)(progress_controller_1.progressController.create));
exports.default = router;
//# sourceMappingURL=progress.routes.js.map
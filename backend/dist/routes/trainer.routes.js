"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
const trainer_controller_1 = require("../controllers/trainer.controller");
const auth_1 = require("../middleware/auth");
const roleGuard_1 = require("../middleware/roleGuard");
const asyncHandler_1 = require("../utils/asyncHandler");
const router = (0, express_1.Router)();
router.get("/", (0, asyncHandler_1.asyncHandler)(trainer_controller_1.trainerController.getAll));
router.get("/:id", (0, asyncHandler_1.asyncHandler)(trainer_controller_1.trainerController.getById));
router.use(auth_1.authenticate, (0, roleGuard_1.authorize)(client_1.UserRole.ADMIN));
router.post("/", (0, asyncHandler_1.asyncHandler)(trainer_controller_1.trainerController.create));
router.patch("/:id", (0, asyncHandler_1.asyncHandler)(trainer_controller_1.trainerController.update));
router.put("/:id", (0, asyncHandler_1.asyncHandler)(trainer_controller_1.trainerController.update));
router.delete("/:id", (0, asyncHandler_1.asyncHandler)(trainer_controller_1.trainerController.remove));
exports.default = router;
//# sourceMappingURL=trainer.routes.js.map
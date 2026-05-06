"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
const booking_controller_1 = require("../controllers/booking.controller");
const auth_1 = require("../middleware/auth");
const roleGuard_1 = require("../middleware/roleGuard");
const asyncHandler_1 = require("../utils/asyncHandler");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get("/", (0, roleGuard_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.FRONT_DESK), (0, asyncHandler_1.asyncHandler)(booking_controller_1.bookingController.getAll));
router.get("/member/:memberId", (0, asyncHandler_1.asyncHandler)(booking_controller_1.bookingController.getByMemberId));
router.post("/", (0, roleGuard_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.FRONT_DESK, client_1.UserRole.MEMBER), (0, asyncHandler_1.asyncHandler)(booking_controller_1.bookingController.create));
router.patch("/:id/attended", (0, roleGuard_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.TRAINER, client_1.UserRole.FRONT_DESK), (0, asyncHandler_1.asyncHandler)(booking_controller_1.bookingController.markAttended));
router.delete("/:id", (0, roleGuard_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.FRONT_DESK, client_1.UserRole.MEMBER), (0, asyncHandler_1.asyncHandler)(booking_controller_1.bookingController.remove));
exports.default = router;
//# sourceMappingURL=booking.routes.js.map
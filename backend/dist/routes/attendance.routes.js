"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
const attendance_controller_1 = require("../controllers/attendance.controller");
const auth_1 = require("../middleware/auth");
const roleGuard_1 = require("../middleware/roleGuard");
const asyncHandler_1 = require("../utils/asyncHandler");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.post("/checkin", (0, validate_1.requireFields)(["memberId"]), (0, roleGuard_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.FRONT_DESK, client_1.UserRole.MEMBER), (0, asyncHandler_1.asyncHandler)(attendance_controller_1.attendanceController.checkIn));
router.post("/checkout", (0, validate_1.requireFields)(["memberId"]), (0, roleGuard_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.FRONT_DESK, client_1.UserRole.MEMBER), (0, asyncHandler_1.asyncHandler)(attendance_controller_1.attendanceController.checkOut));
router.get("/stats", (0, roleGuard_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.FRONT_DESK), (0, asyncHandler_1.asyncHandler)(attendance_controller_1.attendanceController.getStats));
router.get("/today", (0, roleGuard_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.FRONT_DESK), (0, asyncHandler_1.asyncHandler)(attendance_controller_1.attendanceController.getToday));
router.get("/", (0, roleGuard_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.FRONT_DESK, client_1.UserRole.TRAINER), (0, asyncHandler_1.asyncHandler)(attendance_controller_1.attendanceController.getAll));
router.get("/member/:memberId", (0, roleGuard_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.FRONT_DESK, client_1.UserRole.MEMBER, client_1.UserRole.TRAINER), (0, asyncHandler_1.asyncHandler)(attendance_controller_1.attendanceController.getByMemberId));
exports.default = router;
//# sourceMappingURL=attendance.routes.js.map
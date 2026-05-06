"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const asyncHandler_1 = require("../utils/asyncHandler");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
router.post("/register", (0, validate_1.requireFields)(["email", "password"]), (0, asyncHandler_1.asyncHandler)(auth_controller_1.authController.register));
router.post("/login", (0, validate_1.requireFields)(["email", "password"]), (0, asyncHandler_1.asyncHandler)(auth_controller_1.authController.login));
router.post("/logout", auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(auth_controller_1.authController.logout));
router.post("/forgot-password", (0, asyncHandler_1.asyncHandler)(auth_controller_1.authController.forgotPassword));
router.get("/me", auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(auth_controller_1.authController.me));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map
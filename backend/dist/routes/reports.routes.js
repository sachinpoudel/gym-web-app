"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reports_controller_1 = require("../controllers/reports.controller");
const auth_1 = require("../middleware/auth");
const roleGuard_1 = require("../middleware/roleGuard");
const asyncHandler_1 = require("../utils/asyncHandler");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate, roleGuard_1.requireAdmin);
router.get("/overview", (0, asyncHandler_1.asyncHandler)(reports_controller_1.reportsController.overview));
router.get("/revenue", (0, asyncHandler_1.asyncHandler)(reports_controller_1.reportsController.revenue));
router.get("/attendance", (0, asyncHandler_1.asyncHandler)(reports_controller_1.reportsController.attendance));
router.get("/retention", (0, asyncHandler_1.asyncHandler)(reports_controller_1.reportsController.retention));
exports.default = router;
//# sourceMappingURL=reports.routes.js.map
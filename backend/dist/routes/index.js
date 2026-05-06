"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const member_routes_1 = __importDefault(require("./member.routes"));
const payment_routes_1 = __importDefault(require("./payment.routes"));
const reports_routes_1 = __importDefault(require("./reports.routes"));
const router = (0, express_1.Router)();
router.get("/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "Gym API is running"
    });
});
router.use("/auth", auth_routes_1.default);
router.use("/members", member_routes_1.default);
router.use("/payments", payment_routes_1.default);
router.use("/reports", reports_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_service_1 = require("../services/auth.service");
const apiResponse_1 = require("../utils/apiResponse");
const jwt_1 = require("../utils/jwt");
const httpError_1 = require("../utils/httpError");
exports.authController = {
    async register(req, res) {
        const { email, password } = req.body;
        const payload = await auth_service_1.authService.register({
            email,
            password
        });
        const token = (0, jwt_1.signToken)({ userId: payload.user.id, role: payload.user.role });
        return (0, apiResponse_1.sendSuccess)(res, {
            token,
            user: payload.user,
            member: payload.member
        }, "Registered successfully", 201);
    },
    async login(req, res) {
        const { email, password } = req.body;
        const user = await auth_service_1.authService.login(email, password);
        const token = (0, jwt_1.signToken)({ userId: user.id, role: user.role });
        return (0, apiResponse_1.sendSuccess)(res, { token, user }, "Login successful");
    },
    async logout(_req, res) {
        await auth_service_1.authService.logout();
        return (0, apiResponse_1.sendSuccess)(res, null, "Logged out successfully");
    },
    async forgotPassword(_req, res) {
        await auth_service_1.authService.forgotPassword();
        return (0, apiResponse_1.sendSuccess)(res, null, "Password reset request accepted");
    },
    async me(req, res) {
        if (!req.user) {
            throw new httpError_1.HttpError(401, "Unauthorized");
        }
        const user = await auth_service_1.authService.getUserById(req.user.id);
        return (0, apiResponse_1.sendSuccess)(res, user, "Current user");
    }
};
//# sourceMappingURL=auth.controller.js.map
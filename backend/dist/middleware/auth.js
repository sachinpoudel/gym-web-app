"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const auth_service_1 = require("../services/auth.service");
const jwt_1 = require("../utils/jwt");
const httpError_1 = require("../utils/httpError");
const authenticate = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            throw new httpError_1.HttpError(401, "Authorization token missing or invalid");
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            throw new httpError_1.HttpError(401, "Authorization token missing or invalid");
        }
        const payload = (0, jwt_1.verifyToken)(token);
        const user = await auth_service_1.authService.getUserById(payload.userId);
        if (!user) {
            throw new httpError_1.HttpError(401, "User not found");
        }
        req.user = {
            id: user.id,
            role: user.role
        };
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=auth.js.map
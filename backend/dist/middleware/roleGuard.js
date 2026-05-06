"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireTrainer = exports.requireMember = exports.requireAdmin = exports.authorize = void 0;
const client_1 = require("@prisma/client");
const httpError_1 = require("../utils/httpError");
const authorize = (...roles) => {
    return (req, _res, next) => {
        if (!req.user) {
            throw new httpError_1.HttpError(401, "Unauthorized");
        }
        if (!roles.includes(req.user.role)) {
            throw new httpError_1.HttpError(403, "Forbidden");
        }
        next();
    };
};
exports.authorize = authorize;
exports.requireAdmin = (0, exports.authorize)(client_1.UserRole.ADMIN);
exports.requireMember = (0, exports.authorize)(client_1.UserRole.MEMBER, client_1.UserRole.ADMIN);
exports.requireTrainer = (0, exports.authorize)(client_1.UserRole.TRAINER, client_1.UserRole.ADMIN);
//# sourceMappingURL=roleGuard.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const client_1 = require("@prisma/client");
const httpError_1 = require("../utils/httpError");
const errorHandler = (err, _req, res, _next) => {
    if (err instanceof httpError_1.HttpError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            statusCode: err.statusCode
        });
    }
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
            const statusCode = 409;
            return res.status(statusCode).json({
                success: false,
                message: "Unique constraint failed",
                statusCode
            });
        }
        if (err.code === "P2025") {
            const statusCode = 404;
            return res.status(statusCode).json({
                success: false,
                message: "Record not found",
                statusCode
            });
        }
        const statusCode = 400;
        return res.status(statusCode).json({
            success: false,
            message: `Database error: ${err.code}`,
            statusCode
        });
    }
    const statusCode = 500;
    return res.status(statusCode).json({
        success: false,
        message: "Internal server error",
        statusCode
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map
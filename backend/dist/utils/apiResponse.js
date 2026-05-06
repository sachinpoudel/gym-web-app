"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = exports.error = exports.success = void 0;
const success = (res, data, message = "OK", statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};
exports.success = success;
const error = (res, message, statusCode = 400) => {
    return res.status(statusCode).json({
        success: false,
        message
    });
};
exports.error = error;
exports.sendSuccess = exports.success;
//# sourceMappingURL=apiResponse.js.map
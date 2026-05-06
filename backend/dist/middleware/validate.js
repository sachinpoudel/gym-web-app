"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = exports.requireFields = void 0;
const zod_1 = require("zod");
const httpError_1 = require("../utils/httpError");
const requireFields = (fields) => {
    return (req, _res, next) => {
        const missing = fields.filter((field) => req.body[field] === undefined || req.body[field] === null || req.body[field] === "");
        if (missing.length > 0) {
            throw new httpError_1.HttpError(400, `Missing required fields: ${missing.join(", ")}`);
        }
        next();
    };
};
exports.requireFields = requireFields;
const validateBody = (schema) => {
    return (req, _res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const issues = error.issues.map((issue) => ({
                    path: issue.path.join("."),
                    message: issue.message
                }));
                throw new httpError_1.HttpError(400, `Validation failed: ${JSON.stringify(issues)}`);
            }
            throw error;
        }
    };
};
exports.validateBody = validateBody;
//# sourceMappingURL=validate.js.map
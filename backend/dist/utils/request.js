"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRequiredParam = void 0;
const httpError_1 = require("./httpError");
const getRequiredParam = (req, key) => {
    const value = req.params[key];
    if (!value || Array.isArray(value)) {
        throw new httpError_1.HttpError(400, `Missing or invalid URL parameter: ${key}`);
    }
    return value;
};
exports.getRequiredParam = getRequiredParam;
//# sourceMappingURL=request.js.map
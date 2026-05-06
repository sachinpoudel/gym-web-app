"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.signToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const generateToken = (userId, role) => {
    return (0, exports.signToken)({ userId, role });
};
exports.generateToken = generateToken;
const signToken = (payload) => {
    const expiresIn = env_1.env.jwtExpiresIn;
    const options = expiresIn ? { expiresIn } : {};
    return jsonwebtoken_1.default.sign(payload, env_1.env.jwtSecret, options);
};
exports.signToken = signToken;
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, env_1.env.jwtSecret);
};
exports.verifyToken = verifyToken;
//# sourceMappingURL=jwt.js.map
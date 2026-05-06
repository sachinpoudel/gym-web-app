"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("./config/env");
const errorHandler_1 = require("./middleware/errorHandler");
const routes_1 = __importDefault(require("./routes"));
const cronJobs_1 = require("./utils/cronJobs");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: "*",
    credentials: true
}));
app.use(express_1.default.json({ limit: "1mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)(env_1.env.nodeEnv === "production" ? "combined" : "dev"));
app.use((0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false
}));
app.use("/api", routes_1.default);
app.use(errorHandler_1.errorHandler);
(0, cronJobs_1.startCronJobs)();
app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});
app.listen(env_1.env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${env_1.env.port}`);
});
//# sourceMappingURL=index.js.map
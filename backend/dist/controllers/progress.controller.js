"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.progressController = void 0;
const progress_service_1 = require("../services/progress.service");
const apiResponse_1 = require("../utils/apiResponse");
const request_1 = require("../utils/request");
exports.progressController = {
    async create(req, res) {
        const progress = await progress_service_1.progressService.create(req.body);
        return (0, apiResponse_1.sendSuccess)(res, progress, "Progress recorded", 201);
    },
    async getByMemberId(req, res) {
        const progress = await progress_service_1.progressService.getByMemberId((0, request_1.getRequiredParam)(req, "memberId"));
        return (0, apiResponse_1.sendSuccess)(res, progress, "Progress fetched");
    }
};
//# sourceMappingURL=progress.controller.js.map
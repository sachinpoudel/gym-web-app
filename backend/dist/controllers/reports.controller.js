"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsController = void 0;
const reports_service_1 = require("../services/reports.service");
const apiResponse_1 = require("../utils/apiResponse");
exports.reportsController = {
    async overview(_req, res) {
        res.setHeader("Cache-Control", "private, max-age=60");
        const data = await reports_service_1.reportsService.getOverview();
        return (0, apiResponse_1.sendSuccess)(res, data, "Overview report fetched");
    },
    async revenue(req, res) {
        res.setHeader("Cache-Control", "private, max-age=900");
        const period = req.query.period ?? "monthly";
        const data = await reports_service_1.reportsService.getRevenue(period);
        return (0, apiResponse_1.sendSuccess)(res, data, "Revenue report fetched");
    },
    async attendance(req, res) {
        res.setHeader("Cache-Control", "private, max-age=300");
        const startDate = req.query.startDate
            ? new Date(String(req.query.startDate))
            : undefined;
        const endDate = req.query.endDate
            ? new Date(String(req.query.endDate))
            : undefined;
        const data = await reports_service_1.reportsService.getAttendance(startDate, endDate);
        return (0, apiResponse_1.sendSuccess)(res, data, "Attendance report fetched");
    },
    async retention(_req, res) {
        res.setHeader("Cache-Control", "private, max-age=900");
        const data = await reports_service_1.reportsService.getRetention();
        return (0, apiResponse_1.sendSuccess)(res, data, "Retention report fetched");
    }
};
//# sourceMappingURL=reports.controller.js.map
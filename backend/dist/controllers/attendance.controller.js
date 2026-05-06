"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attendanceController = void 0;
const client_1 = require("@prisma/client");
const attendance_service_1 = require("../services/attendance.service");
const apiResponse_1 = require("../utils/apiResponse");
const request_1 = require("../utils/request");
exports.attendanceController = {
    async checkIn(req, res) {
        const record = await attendance_service_1.attendanceService.checkIn(req.body.memberId, req.body.method ?? client_1.CheckInMethod.MANUAL);
        return (0, apiResponse_1.sendSuccess)(res, record, "Checked in", 201);
    },
    async checkOut(req, res) {
        const record = await attendance_service_1.attendanceService.checkOut(req.body.memberId);
        return (0, apiResponse_1.sendSuccess)(res, record, "Checked out");
    },
    async getAll(req, res) {
        const page = Math.max(Number(req.query.page ?? 1), 1);
        const limit = Math.min(Math.max(Number(req.query.limit ?? 10), 1), 100);
        const memberId = req.query.memberId;
        const date = req.query.date ? new Date(String(req.query.date)) : undefined;
        const startDate = req.query.startDate
            ? new Date(String(req.query.startDate))
            : undefined;
        const endDate = req.query.endDate
            ? new Date(String(req.query.endDate))
            : undefined;
        const data = await attendance_service_1.attendanceService.getAll({
            ...(memberId ? { memberId } : {}),
            ...(date ? { date } : {}),
            ...(startDate ? { startDate } : {}),
            ...(endDate ? { endDate } : {}),
            page,
            limit
        });
        return (0, apiResponse_1.sendSuccess)(res, data, "Attendance fetched");
    },
    async getToday(_req, res) {
        const data = await attendance_service_1.attendanceService.getToday();
        return (0, apiResponse_1.sendSuccess)(res, data, "Today's attendance fetched");
    },
    async getStats(_req, res) {
        const data = await attendance_service_1.attendanceService.getStats();
        return (0, apiResponse_1.sendSuccess)(res, data, "Attendance stats fetched");
    },
    async getByMemberId(req, res) {
        const records = await attendance_service_1.attendanceService.getByMemberId((0, request_1.getRequiredParam)(req, "memberId"));
        return (0, apiResponse_1.sendSuccess)(res, records, "Attendance fetched");
    }
};
//# sourceMappingURL=attendance.controller.js.map
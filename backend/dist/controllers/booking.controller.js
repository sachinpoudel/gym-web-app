"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingController = void 0;
const booking_service_1 = require("../services/booking.service");
const apiResponse_1 = require("../utils/apiResponse");
const request_1 = require("../utils/request");
exports.bookingController = {
    async create(req, res) {
        const booking = await booking_service_1.bookingService.create(req.body.memberId, req.body.classId);
        return (0, apiResponse_1.sendSuccess)(res, booking, "Booking created", 201);
    },
    async getAll(_req, res) {
        const bookings = await booking_service_1.bookingService.getAll();
        return (0, apiResponse_1.sendSuccess)(res, bookings, "Bookings fetched");
    },
    async getByMemberId(req, res) {
        const bookings = await booking_service_1.bookingService.getByMemberId((0, request_1.getRequiredParam)(req, "memberId"));
        return (0, apiResponse_1.sendSuccess)(res, bookings, "Member bookings fetched");
    },
    async markAttended(req, res) {
        const booking = await booking_service_1.bookingService.update((0, request_1.getRequiredParam)(req, "id"), {
            attended: true
        });
        return (0, apiResponse_1.sendSuccess)(res, booking, "Booking marked attended");
    },
    async remove(req, res) {
        await booking_service_1.bookingService.remove((0, request_1.getRequiredParam)(req, "id"));
        return (0, apiResponse_1.sendSuccess)(res, null, "Booking removed");
    }
};
//# sourceMappingURL=booking.controller.js.map
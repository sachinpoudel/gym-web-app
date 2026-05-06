"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classController = void 0;
const class_service_1 = require("../services/class.service");
const apiResponse_1 = require("../utils/apiResponse");
const request_1 = require("../utils/request");
exports.classController = {
    async create(req, res) {
        const gymClass = await class_service_1.classService.create(req.body);
        return (0, apiResponse_1.sendSuccess)(res, gymClass, "Class created", 201);
    },
    async getAll(_req, res) {
        const classes = await class_service_1.classService.getAll();
        return (0, apiResponse_1.sendSuccess)(res, classes, "Classes fetched");
    },
    async getById(req, res) {
        const gymClass = await class_service_1.classService.getById((0, request_1.getRequiredParam)(req, "id"));
        return (0, apiResponse_1.sendSuccess)(res, gymClass, "Class fetched");
    },
    async update(req, res) {
        const gymClass = await class_service_1.classService.update((0, request_1.getRequiredParam)(req, "id"), req.body);
        return (0, apiResponse_1.sendSuccess)(res, gymClass, "Class updated");
    },
    async remove(req, res) {
        await class_service_1.classService.remove((0, request_1.getRequiredParam)(req, "id"));
        return (0, apiResponse_1.sendSuccess)(res, null, "Class removed");
    },
    async book(req, res) {
        const booking = await class_service_1.classService.bookClass((0, request_1.getRequiredParam)(req, "id"), req.body.memberId);
        return (0, apiResponse_1.sendSuccess)(res, booking, "Class booked", 201);
    },
    async cancelBooking(req, res) {
        await class_service_1.classService.cancelBooking((0, request_1.getRequiredParam)(req, "id"), (0, request_1.getRequiredParam)(req, "memberId"));
        return (0, apiResponse_1.sendSuccess)(res, null, "Booking canceled");
    }
};
//# sourceMappingURL=class.controller.js.map
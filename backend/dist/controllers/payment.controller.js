"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentController = void 0;
const payment_service_1 = require("../services/payment.service");
const apiResponse_1 = require("../utils/apiResponse");
const request_1 = require("../utils/request");
exports.paymentController = {
    async create(req, res) {
        const payment = await payment_service_1.paymentService.create({
            ...req.body,
            dueDate: new Date(req.body.dueDate),
            paidAt: req.body.paidAt ? new Date(req.body.paidAt) : undefined
        });
        return (0, apiResponse_1.sendSuccess)(res, payment, "Payment created", 201);
    },
    async getAll(req, res) {
        const status = req.query.status;
        const memberId = req.query.memberId;
        const payments = await payment_service_1.paymentService.getAll({
            ...(status ? { status } : {}),
            ...(memberId ? { memberId } : {})
        });
        return (0, apiResponse_1.sendSuccess)(res, payments, "Payments fetched");
    },
    async getByMemberId(req, res) {
        const payments = await payment_service_1.paymentService.getByMemberId((0, request_1.getRequiredParam)(req, "memberId"));
        return (0, apiResponse_1.sendSuccess)(res, payments, "Member payments fetched");
    },
    async updateStatus(req, res) {
        const payment = await payment_service_1.paymentService.updateStatus((0, request_1.getRequiredParam)(req, "id"), req.body.status);
        return (0, apiResponse_1.sendSuccess)(res, payment, "Payment status updated");
    },
    async markPaid(req, res) {
        const payment = await payment_service_1.paymentService.markPaid((0, request_1.getRequiredParam)(req, "id"));
        return (0, apiResponse_1.sendSuccess)(res, payment, "Payment marked as paid");
    },
    async getSummary(_req, res) {
        const summary = await payment_service_1.paymentService.getSummary();
        return (0, apiResponse_1.sendSuccess)(res, summary, "Payment summary fetched");
    },
    async getMonthly(_req, res) {
        const monthly = await payment_service_1.paymentService.getMonthlyTotals();
        return (0, apiResponse_1.sendSuccess)(res, monthly, "Monthly payment totals fetched");
    },
    async getYearly(_req, res) {
        const yearly = await payment_service_1.paymentService.getYearlyTotals();
        return (0, apiResponse_1.sendSuccess)(res, yearly, "Yearly payment totals fetched");
    },
    async getOverdue(_req, res) {
        const overdue = await payment_service_1.paymentService.getOverdue();
        return (0, apiResponse_1.sendSuccess)(res, overdue, "Overdue payments fetched");
    },
    async sendReminder(req, res) {
        const result = await payment_service_1.paymentService.sendReminder((0, request_1.getRequiredParam)(req, "id"));
        return (0, apiResponse_1.sendSuccess)(res, result, "Payment reminder sent");
    }
};
//# sourceMappingURL=payment.controller.js.map
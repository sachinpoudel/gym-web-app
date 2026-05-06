"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memberController = void 0;
const client_1 = require("@prisma/client");
const member_service_1 = require("../services/member.service");
const apiResponse_1 = require("../utils/apiResponse");
const request_1 = require("../utils/request");
const httpError_1 = require("../utils/httpError");
const PLAN_MONTHS = {
    BASIC: 1,
    PRO: 3,
    ELITE: 12
};
const calculateExpiryDate = (joinDate, plan) => {
    const expiry = new Date(joinDate);
    expiry.setMonth(expiry.getMonth() + PLAN_MONTHS[plan]);
    return expiry;
};
exports.memberController = {
    async create(req, res) {
        const requiredFields = ["email", "firstName", "lastName", "phone", "dateOfBirth", "paymentAmount"];
        const missing = requiredFields.find((field) => req.body[field] === undefined || req.body[field] === null || req.body[field] === "");
        if (missing) {
            throw new httpError_1.HttpError(400, `${missing} is required`);
        }
        const plan = req.body.plan ?? client_1.MemberPlan.BASIC;
        const joinDate = req.body.joinDate ? new Date(req.body.joinDate) : new Date();
        const expiryDate = req.body.expiryDate
            ? new Date(req.body.expiryDate)
            : calculateExpiryDate(joinDate, plan);
        const emergencyContactName = req.body.emergencyContactName?.trim();
        const emergencyContactPhone = req.body.emergencyContactPhone?.trim();
        const data = {
            email: String(req.body.email).trim().toLowerCase(),
            firstName: String(req.body.firstName).trim(),
            lastName: String(req.body.lastName).trim(),
            phone: String(req.body.phone).trim(),
            dateOfBirth: new Date(req.body.dateOfBirth),
            plan,
            joinDate,
            expiryDate,
            status: req.body.status ?? client_1.MemberStatus.ACTIVE,
            ...(emergencyContactName && emergencyContactPhone
                ? { emergencyContact: `${emergencyContactName} | ${emergencyContactPhone}` }
                : {}),
            ...(req.body.healthNotes ? { healthNotes: String(req.body.healthNotes) } : {}),
            paymentAmount: Number(req.body.paymentAmount ?? 0),
            paymentMethod: req.body.paymentMethod ?? client_1.PaymentMethod.CASH
        };
        const payload = await member_service_1.memberService.createOnboarding(data);
        return (0, apiResponse_1.sendSuccess)(res, payload, "Member created", 201);
    },
    async getAll(req, res) {
        const page = Math.max(Number(req.query.page ?? 1), 1);
        const limit = Math.min(Math.max(Number(req.query.limit ?? 10), 1), 100);
        const status = req.query.status;
        const plan = req.query.plan;
        const search = req.query.search;
        const members = await member_service_1.memberService.getAll({
            ...(status ? { status } : {}),
            ...(plan ? { plan } : {}),
            ...(search ? { search } : {}),
            page,
            limit
        });
        return (0, apiResponse_1.sendSuccess)(res, members, "Members fetched");
    },
    async getExpiring(_req, res) {
        const members = await member_service_1.memberService.getExpiringInDays(7);
        return (0, apiResponse_1.sendSuccess)(res, members, "Expiring members fetched");
    },
    async getById(req, res) {
        const member = await member_service_1.memberService.getById((0, request_1.getRequiredParam)(req, "id"));
        return (0, apiResponse_1.sendSuccess)(res, member, "Member fetched");
    },
    async update(req, res) {
        const updateData = { ...req.body };
        if (updateData.emergencyContactName !== undefined || updateData.emergencyContactPhone !== undefined) {
            updateData.emergencyContact = `${updateData.emergencyContactName || ""} | ${updateData.emergencyContactPhone || ""}`;
            delete updateData.emergencyContactName;
            delete updateData.emergencyContactPhone;
        }
        // Ignore payment fields to prevent Prisma crashes during member update
        delete updateData.paymentMethod;
        delete updateData.paymentAmount;
        const member = await member_service_1.memberService.update((0, request_1.getRequiredParam)(req, "id"), updateData);
        return (0, apiResponse_1.sendSuccess)(res, member, "Member updated");
    },
    async updateStatus(req, res) {
        const member = await member_service_1.memberService.updateStatus((0, request_1.getRequiredParam)(req, "id"), req.body.status);
        return (0, apiResponse_1.sendSuccess)(res, member, "Member status updated");
    },
    async remove(req, res) {
        await member_service_1.memberService.remove((0, request_1.getRequiredParam)(req, "id"));
        return (0, apiResponse_1.sendSuccess)(res, null, "Member set to expired");
    },
    async freeze(req, res) {
        const member = await member_service_1.memberService.freeze((0, request_1.getRequiredParam)(req, "id"));
        return (0, apiResponse_1.sendSuccess)(res, member, "Member frozen");
    },
    async activate(req, res) {
        const member = await member_service_1.memberService.activate((0, request_1.getRequiredParam)(req, "id"));
        return (0, apiResponse_1.sendSuccess)(res, member, "Member activated");
    },
    async getStats(req, res) {
        const stats = await member_service_1.memberService.getStats((0, request_1.getRequiredParam)(req, "id"));
        return (0, apiResponse_1.sendSuccess)(res, stats, "Member stats fetched");
    }
};
//# sourceMappingURL=member.controller.js.map
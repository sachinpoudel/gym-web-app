"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memberService = void 0;
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const prisma_1 = require("../config/prisma");
const password_1 = require("../utils/password");
const httpError_1 = require("../utils/httpError");
const createTemporaryPassword = () => {
    return `Temp#${(0, crypto_1.randomUUID)().replace(/-/g, "")}`;
};
exports.memberService = {
    async createOnboarding(data) {
        if (!Number.isFinite(data.paymentAmount) || data.paymentAmount < 0) {
            throw new httpError_1.HttpError(400, "Payment amount must be a non-negative number");
        }
        const existing = await prisma_1.prisma.user.findUnique({ where: { email: data.email } });
        if (existing) {
            throw new httpError_1.HttpError(409, "Email already in use");
        }
        const temporaryPasswordHash = await (0, password_1.hashPassword)(createTemporaryPassword());
        return prisma_1.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: data.email,
                    password: temporaryPasswordHash,
                    role: client_1.UserRole.MEMBER
                }
            });
            const member = await tx.member.create({
                data: {
                    userId: user.id,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phone: data.phone,
                    dateOfBirth: data.dateOfBirth,
                    plan: data.plan,
                    status: data.status,
                    joinDate: data.joinDate,
                    expiryDate: data.expiryDate,
                    ...(data.emergencyContact ? { emergencyContact: data.emergencyContact } : {}),
                    ...(data.healthNotes ? { healthNotes: data.healthNotes } : {}),
                    qrCode: (0, crypto_1.randomUUID)()
                }
            });
            const payment = await tx.payment.create({
                data: {
                    memberId: member.id,
                    amount: data.paymentAmount,
                    plan: data.plan,
                    method: data.paymentMethod,
                    status: client_1.PaymentStatus.PAID,
                    paidAt: new Date(),
                    dueDate: data.expiryDate
                }
            });
            return {
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role
                },
                member,
                payment
            };
        });
    },
    async getAll(filters) {
        const { status, plan, search, page, limit } = filters;
        const skip = (page - 1) * limit;
        const where = {
            ...(status ? { status } : {}),
            ...(plan ? { plan } : {}),
            ...(search
                ? {
                    OR: [
                        { firstName: { contains: search, mode: "insensitive" } },
                        { lastName: { contains: search, mode: "insensitive" } },
                        { phone: { contains: search, mode: "insensitive" } },
                        { user: { email: { contains: search, mode: "insensitive" } } }
                    ]
                }
                : {})
        };
        const [total, data] = await Promise.all([
            prisma_1.prisma.member.count({ where }),
            prisma_1.prisma.member.findMany({
                where,
                include: {
                    user: { select: { email: true, role: true } }
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit
            })
        ]);
        const mapped = data.map((member) => {
            const daysToExpiry = Math.ceil((member.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return {
                ...member,
                daysToExpiry,
                isExpiringSoon: daysToExpiry >= 0 && daysToExpiry <= 7
            };
        });
        return { total, data: mapped };
    },
    getExpiringInDays(days) {
        const now = new Date();
        const end = new Date(now);
        end.setDate(end.getDate() + days);
        return prisma_1.prisma.member.findMany({
            where: {
                expiryDate: {
                    gte: now,
                    lte: end
                }
            },
            include: {
                user: { select: { email: true, role: true } }
            },
            orderBy: { expiryDate: "asc" }
        });
    },
    getById(id) {
        return prisma_1.prisma.member.findUnique({
            where: { id },
            include: {
                user: { select: { email: true, role: true } },
                payments: true,
                progress: true,
                attendance: true,
                bookings: { include: { gymClass: true } }
            }
        });
    },
    update(id, data) {
        return prisma_1.prisma.member.update({ where: { id }, data });
    },
    updateStatus(id, status) {
        return prisma_1.prisma.member.update({
            where: { id },
            data: { status }
        });
    },
    remove(id) {
        return prisma_1.prisma.member.update({
            where: { id },
            data: { status: client_1.MemberStatus.EXPIRED }
        });
    },
    freeze(id) {
        return prisma_1.prisma.member.update({
            where: { id },
            data: { status: client_1.MemberStatus.FROZEN }
        });
    },
    activate(id) {
        return prisma_1.prisma.member.update({
            where: { id },
            data: { status: client_1.MemberStatus.ACTIVE }
        });
    },
    async getStats(memberId) {
        const [checkInCount, classesAttended, paymentSummary] = await Promise.all([
            prisma_1.prisma.attendance.count({ where: { memberId } }),
            prisma_1.prisma.booking.count({ where: { memberId, attended: true } }),
            prisma_1.prisma.payment.groupBy({
                by: ["status"],
                where: { memberId },
                _sum: { amount: true },
                _count: { _all: true }
            })
        ]);
        return {
            checkInCount,
            classesAttended,
            paymentSummary
        };
    }
};
//# sourceMappingURL=member.service.js.map
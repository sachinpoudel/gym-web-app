"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../config/prisma");
exports.paymentService = {
    create(data) {
        return prisma_1.prisma.payment.create({ data });
    },
    getAll(filters) {
        return prisma_1.prisma.payment.findMany({
            where: {
                ...(filters?.status ? { status: filters.status } : {}),
                ...(filters?.memberId ? { memberId: filters.memberId } : {})
            },
            include: { member: true },
            orderBy: { createdAt: "desc" }
        });
    },
    getByMemberId(memberId) {
        return prisma_1.prisma.payment.findMany({
            where: { memberId },
            orderBy: { createdAt: "desc" }
        });
    },
    updateStatus(id, status) {
        return prisma_1.prisma.payment.update({
            where: { id },
            data: {
                status,
                paidAt: status === client_1.PaymentStatus.PAID ? new Date() : null
            }
        });
    },
    markPaid(id) {
        return prisma_1.prisma.payment.update({
            where: { id },
            data: {
                status: client_1.PaymentStatus.PAID,
                paidAt: new Date()
            }
        });
    },
    async getSummary() {
        const now = new Date();
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - 6);
        weekStart.setHours(0, 0, 0, 0);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const yearStart = new Date(now.getFullYear(), 0, 1);
        const [today, week, month, year] = await Promise.all([
            prisma_1.prisma.payment.aggregate({
                _sum: { amount: true },
                where: {
                    status: client_1.PaymentStatus.PAID,
                    paidAt: { gte: todayStart }
                }
            }),
            prisma_1.prisma.payment.aggregate({
                _sum: { amount: true },
                where: {
                    status: client_1.PaymentStatus.PAID,
                    paidAt: { gte: weekStart }
                }
            }),
            prisma_1.prisma.payment.aggregate({
                _sum: { amount: true },
                where: {
                    status: client_1.PaymentStatus.PAID,
                    paidAt: { gte: monthStart }
                }
            }),
            prisma_1.prisma.payment.aggregate({
                _sum: { amount: true },
                where: {
                    status: client_1.PaymentStatus.PAID,
                    paidAt: { gte: yearStart }
                }
            })
        ]);
        return {
            today: today._sum.amount ?? 0,
            week: week._sum.amount ?? 0,
            month: month._sum.amount ?? 0,
            year: year._sum.amount ?? 0
        };
    },
    async getMonthlyTotals() {
        const rows = await prisma_1.prisma.$queryRaw `
      SELECT DATE_TRUNC('month', "paidAt") as month,
             SUM("amount") as total
      FROM "Payment"
      WHERE "status" = 'PAID' AND "paidAt" IS NOT NULL
      GROUP BY month
      ORDER BY month ASC
    `;
        return rows.map((row) => ({
            month: row.month,
            total: Number(row.total)
        }));
    },
    async getYearlyTotals() {
        const rows = await prisma_1.prisma.$queryRaw `
      SELECT DATE_TRUNC('year', "paidAt") as year,
             SUM("amount") as total
      FROM "Payment"
      WHERE "status" = 'PAID' AND "paidAt" IS NOT NULL
      GROUP BY year
      ORDER BY year ASC
    `;
        return rows.map((row) => ({
            year: row.year,
            total: Number(row.total)
        }));
    },
    getOverdue() {
        return prisma_1.prisma.payment.findMany({
            where: {
                status: client_1.PaymentStatus.OVERDUE
            },
            include: {
                member: {
                    select: {
                        firstName: true,
                        lastName: true,
                        phone: true,
                        user: { select: { email: true } }
                    }
                }
            },
            orderBy: { dueDate: "asc" }
        });
    },
    sendReminder(id) {
        console.log(`[payments] reminder sent for payment ${id}`);
        return {
            success: true
        };
    }
};
//# sourceMappingURL=payment.service.js.map
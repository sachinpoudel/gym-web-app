"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../config/prisma");
exports.reportsService = {
    async getOverview() {
        const now = new Date();
        const weekday = now
            .toLocaleDateString("en-US", { weekday: "long" })
            .toUpperCase();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        const yearStart = new Date(now.getFullYear(), 0, 1);
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - 6);
        weekStart.setHours(0, 0, 0, 0);
        const next7Days = new Date(now);
        next7Days.setDate(next7Days.getDate() + 7);
        const [total, active, expired, frozen, newThisMonth, paidToday, paidThisMonth, paidThisYear, paidLastMonth, attendanceToday, attendanceThisWeek, attendanceThisMonth, totalClasses, classesToday, popularClass, expiringSoon, planDistribution, overdueCount, monthlyRevenueRows, retentionRows] = await Promise.all([
            prisma_1.prisma.member.count(),
            prisma_1.prisma.member.count({ where: { status: client_1.MemberStatus.ACTIVE } }),
            prisma_1.prisma.member.count({ where: { status: client_1.MemberStatus.EXPIRED } }),
            prisma_1.prisma.member.count({ where: { status: client_1.MemberStatus.FROZEN } }),
            prisma_1.prisma.member.count({ where: { createdAt: { gte: monthStart } } }),
            prisma_1.prisma.payment.aggregate({
                _sum: { amount: true },
                where: { status: client_1.PaymentStatus.PAID, paidAt: { gte: todayStart } }
            }),
            prisma_1.prisma.payment.aggregate({
                _sum: { amount: true },
                where: { status: client_1.PaymentStatus.PAID, paidAt: { gte: monthStart } }
            }),
            prisma_1.prisma.payment.aggregate({
                _sum: { amount: true },
                where: { status: client_1.PaymentStatus.PAID, paidAt: { gte: yearStart } }
            }),
            prisma_1.prisma.payment.aggregate({
                _sum: { amount: true },
                where: {
                    status: client_1.PaymentStatus.PAID,
                    paidAt: { gte: lastMonthStart, lte: lastMonthEnd }
                }
            }),
            prisma_1.prisma.attendance.count({ where: { checkIn: { gte: todayStart } } }),
            prisma_1.prisma.attendance.count({ where: { checkIn: { gte: weekStart } } }),
            prisma_1.prisma.attendance.count({ where: { checkIn: { gte: monthStart } } }),
            prisma_1.prisma.gymClass.count(),
            prisma_1.prisma.gymClass.count({ where: { day: weekday } }),
            prisma_1.prisma.gymClass.findFirst({
                orderBy: { bookings: { _count: "desc" } },
                include: { _count: { select: { bookings: true } } }
            }),
            prisma_1.prisma.member.findMany({
                where: {
                    expiryDate: { gte: now, lte: next7Days }
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    expiryDate: true,
                    user: { select: { email: true } }
                },
                take: 10,
                orderBy: { expiryDate: "asc" }
            }),
            prisma_1.prisma.member.groupBy({
                by: ["plan"],
                _count: { _all: true }
            }),
            prisma_1.prisma.payment.count({
                where: { status: client_1.PaymentStatus.OVERDUE }
            }),
            prisma_1.prisma.$queryRaw `
        SELECT DATE_TRUNC('month', "paidAt") as period,
               SUM("amount") as total
        FROM "Payment"
        WHERE "status" = 'PAID' AND "paidAt" IS NOT NULL
        GROUP BY period
        ORDER BY period ASC
      `,
            prisma_1.prisma.$queryRaw `
        SELECT DATE_TRUNC('month', "createdAt") as month,
               COUNT(*) as count
        FROM "Member"
        GROUP BY month
        ORDER BY month ASC
      `
        ]);
        const revenueLast12Months = monthlyRevenueRows.slice(-12).map((row) => ({
            period: row.period,
            total: Number(row.total)
        }));
        const memberGrowthLast12Months = retentionRows.slice(-12).map((row) => ({
            month: row.month,
            count: Number(row.count)
        }));
        const expiringSoonMembers = expiringSoon.map((member) => ({
            id: member.id,
            firstName: member.firstName,
            lastName: member.lastName,
            email: member.user.email,
            expiryDate: member.expiryDate
        }));
        const stats = {
            totalMembers: total,
            activeMembers: active,
            expiredMembers: expired,
            frozenMembers: frozen,
            newMembersThisMonth: newThisMonth,
            expiringIn7Days: expiringSoonMembers.length,
            revenueThisMonth: paidThisMonth._sum.amount ?? 0,
            revenueToday: paidToday._sum.amount ?? 0,
            revenueThisYear: paidThisYear._sum.amount ?? 0,
            revenueLastMonth: paidLastMonth._sum.amount ?? 0,
            attendanceToday,
            attendanceThisWeek,
            attendanceThisMonth,
            classesToday,
            totalClasses
        };
        const alerts = {
            expiringSoonMembers,
            overduePaymentsCount: overdueCount,
            systemAlerts: [
                {
                    id: "expiring-7-days",
                    type: "expiring",
                    text: `${expiringSoonMembers.length} memberships will expire in the next 7 days.`
                },
                {
                    id: "overdue-payments",
                    type: "overdue",
                    text: `${overdueCount} payments are currently overdue.`
                }
            ]
        };
        const trends = {
            revenueLast12Months,
            memberGrowthLast12Months,
            planDistribution: planDistribution.map((item) => ({
                name: item.plan,
                value: item._count._all
            }))
        };
        return {
            stats,
            trends,
            alerts,
            members: {
                total,
                active,
                expired,
                frozen,
                newThisMonth
            },
            revenue: {
                today: paidToday._sum.amount ?? 0,
                thisMonth: paidThisMonth._sum.amount ?? 0,
                thisYear: paidThisYear._sum.amount ?? 0,
                lastMonth: paidLastMonth._sum.amount ?? 0
            },
            attendance: {
                today: attendanceToday,
                thisWeek: attendanceThisWeek,
                thisMonth: attendanceThisMonth
            },
            classes: {
                total: totalClasses,
                today: classesToday,
                mostPopular: popularClass
                    ? {
                        id: popularClass.id,
                        name: popularClass.name,
                        bookingCount: popularClass._count.bookings
                    }
                    : null
            },
            planDistribution: trends.planDistribution,
            alertItems: [
                {
                    id: "expiring-7-days",
                    type: "expiring",
                    text: `${expiringSoon.length} memberships will expire in the next 7 days.`
                },
                {
                    id: "overdue-payments",
                    type: "overdue",
                    text: `${overdueCount} payments are currently overdue.`
                }
            ],
            expiringSoon: expiringSoonMembers
        };
    },
    async getRevenue(period) {
        if (period === "yearly") {
            const rows = await prisma_1.prisma.$queryRaw `
        SELECT DATE_TRUNC('year', "paidAt") as period,
               SUM("amount") as total
        FROM "Payment"
        WHERE "status" = 'PAID' AND "paidAt" IS NOT NULL
        GROUP BY period
        ORDER BY period ASC
      `;
            return rows.map((row) => ({
                period: row.period,
                total: Number(row.total)
            }));
        }
        const rows = await prisma_1.prisma.$queryRaw `
      SELECT DATE_TRUNC('month', "paidAt") as period,
             SUM("amount") as total
      FROM "Payment"
      WHERE "status" = 'PAID' AND "paidAt" IS NOT NULL
      GROUP BY period
      ORDER BY period ASC
    `;
        return rows.map((row) => ({
            period: row.period,
            total: Number(row.total)
        }));
    },
    async getAttendance(startDate, endDate) {
        const rows = await prisma_1.prisma.$queryRaw `
      SELECT DATE_TRUNC('day', "checkIn") as day,
             COUNT(*) as count
      FROM "Attendance"
      WHERE (${startDate}::timestamp IS NULL OR "checkIn" >= ${startDate})
        AND (${endDate}::timestamp IS NULL OR "checkIn" <= ${endDate})
      GROUP BY day
      ORDER BY day ASC
    `;
        return rows.map((row) => ({
            day: row.day,
            count: Number(row.count)
        }));
    },
    async getRetention() {
        const rows = await prisma_1.prisma.$queryRaw `
      SELECT DATE_TRUNC('month', "createdAt") as month,
             COUNT(*) as count
      FROM "Member"
      GROUP BY month
      ORDER BY month ASC
    `;
        return rows.map((row) => ({
            month: row.month,
            count: Number(row.count)
        }));
    }
};
//# sourceMappingURL=reports.service.js.map
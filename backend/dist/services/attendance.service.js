"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attendanceService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../config/prisma");
const httpError_1 = require("../utils/httpError");
const getDayRange = (reference = new Date()) => {
    const start = new Date(reference);
    start.setHours(0, 0, 0, 0);
    const end = new Date(reference);
    end.setHours(23, 59, 59, 999);
    return { start, end };
};
exports.attendanceService = {
    async checkIn(memberId, method) {
        const member = await prisma_1.prisma.member.findUnique({
            where: { id: memberId },
            select: { id: true, firstName: true, status: true }
        });
        if (!member) {
            throw new httpError_1.HttpError(404, "Member not found");
        }
        if (member.status !== client_1.MemberStatus.ACTIVE) {
            throw new httpError_1.HttpError(400, "Member is not active");
        }
        const { start, end } = getDayRange();
        const existingOpen = await prisma_1.prisma.attendance.findFirst({
            where: {
                memberId,
                checkIn: { gte: start, lte: end },
                checkOut: null
            }
        });
        if (existingOpen) {
            throw new httpError_1.HttpError(409, "Member already has an open check-in for today");
        }
        const attendance = await prisma_1.prisma.attendance.create({
            data: {
                memberId,
                method
            }
        });
        return {
            attendance,
            firstName: member.firstName
        };
    },
    async checkOut(memberId) {
        const { start, end } = getDayRange();
        const attendance = await prisma_1.prisma.attendance.findFirst({
            where: {
                memberId,
                checkIn: { gte: start, lte: end },
                checkOut: null
            },
            orderBy: { checkIn: "desc" }
        });
        if (!attendance) {
            throw new httpError_1.HttpError(404, "No open check-in found for today");
        }
        const now = new Date();
        const duration = Math.max(0, Math.floor((now.getTime() - attendance.checkIn.getTime()) / 60000));
        return prisma_1.prisma.attendance.update({
            where: { id: attendance.id },
            data: {
                checkOut: now,
                duration
            }
        });
    },
    async getAll(filters) {
        const { memberId, date, startDate, endDate, page, limit } = filters;
        const skip = (page - 1) * limit;
        let checkInRange;
        if (date) {
            const { start, end } = getDayRange(date);
            checkInRange = { gte: start, lte: end };
        }
        else if (startDate || endDate) {
            checkInRange = {
                ...(startDate ? { gte: startDate } : {}),
                ...(endDate ? { lte: endDate } : {})
            };
        }
        const where = {
            ...(memberId ? { memberId } : {}),
            ...(checkInRange ? { checkIn: checkInRange } : {})
        };
        const [total, data] = await Promise.all([
            prisma_1.prisma.attendance.count({ where }),
            prisma_1.prisma.attendance.findMany({
                where,
                include: {
                    member: {
                        select: {
                            firstName: true,
                            lastName: true,
                            user: { select: { email: true } }
                        }
                    }
                },
                orderBy: { checkIn: "desc" },
                skip,
                take: limit
            })
        ]);
        return { total, data };
    },
    getToday() {
        const { start, end } = getDayRange();
        return prisma_1.prisma.attendance.findMany({
            where: {
                checkIn: { gte: start, lte: end }
            },
            include: {
                member: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            },
            orderBy: { checkIn: "desc" }
        });
    },
    async getStats() {
        const now = new Date();
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - 6);
        weekStart.setHours(0, 0, 0, 0);
        const monthStart = new Date(now);
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        const last30Start = new Date(now);
        last30Start.setDate(last30Start.getDate() - 29);
        last30Start.setHours(0, 0, 0, 0);
        const [todayCount, weekCount, monthCount, rows] = await Promise.all([
            prisma_1.prisma.attendance.count({ where: { checkIn: { gte: todayStart } } }),
            prisma_1.prisma.attendance.count({ where: { checkIn: { gte: weekStart } } }),
            prisma_1.prisma.attendance.count({ where: { checkIn: { gte: monthStart } } }),
            prisma_1.prisma.$queryRaw `
        SELECT DATE_TRUNC('day', "checkIn") as day, COUNT(*) as count
        FROM "Attendance"
        WHERE "checkIn" >= ${last30Start}
        GROUP BY day
        ORDER BY day ASC
      `
        ]);
        return {
            todayCount,
            weekCount,
            monthCount,
            dailyCountsLast30Days: rows.map((row) => ({
                day: row.day,
                count: Number(row.count)
            }))
        };
    },
    getByMemberId(memberId) {
        return prisma_1.prisma.attendance.findMany({
            where: { memberId },
            orderBy: { checkIn: "desc" }
        });
    }
};
//# sourceMappingURL=attendance.service.js.map
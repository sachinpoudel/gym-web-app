"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingService = void 0;
const prisma_1 = require("../config/prisma");
const httpError_1 = require("../utils/httpError");
exports.bookingService = {
    async create(memberId, classId) {
        const targetClass = await prisma_1.prisma.gymClass.findUnique({
            where: { id: classId },
            include: { bookings: true }
        });
        if (!targetClass) {
            throw new httpError_1.HttpError(404, "Class not found");
        }
        if (targetClass.bookings.length >= targetClass.maxCapacity) {
            throw new httpError_1.HttpError(400, "Class is full");
        }
        return prisma_1.prisma.booking.create({
            data: {
                memberId,
                classId
            }
        });
    },
    getAll() {
        return prisma_1.prisma.booking.findMany({
            include: {
                member: true,
                gymClass: true
            },
            orderBy: { bookedAt: "desc" }
        });
    },
    getByMemberId(memberId) {
        return prisma_1.prisma.booking.findMany({
            where: { memberId },
            include: {
                gymClass: true
            },
            orderBy: { bookedAt: "desc" }
        });
    },
    update(id, data) {
        return prisma_1.prisma.booking.update({ where: { id }, data });
    },
    remove(id) {
        return prisma_1.prisma.booking.delete({ where: { id } });
    }
};
//# sourceMappingURL=booking.service.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classService = void 0;
const prisma_1 = require("../config/prisma");
const httpError_1 = require("../utils/httpError");
exports.classService = {
    create(data) {
        return prisma_1.prisma.gymClass.create({ data });
    },
    getAll() {
        return prisma_1.prisma.gymClass.findMany({
            include: {
                trainer: {
                    select: {
                        firstName: true,
                        lastName: true,
                        specialty: true
                    }
                },
                _count: {
                    select: { bookings: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });
    },
    getById(id) {
        return prisma_1.prisma.gymClass.findUnique({
            where: { id },
            include: {
                trainer: true,
                bookings: { include: { member: true } }
            }
        });
    },
    update(id, data) {
        return prisma_1.prisma.gymClass.update({ where: { id }, data });
    },
    remove(id) {
        return prisma_1.prisma.gymClass.delete({ where: { id } });
    },
    async bookClass(classId, memberId) {
        const gymClass = await prisma_1.prisma.gymClass.findUnique({
            where: { id: classId },
            include: {
                _count: { select: { bookings: true } }
            }
        });
        if (!gymClass) {
            throw new httpError_1.HttpError(404, "Class not found");
        }
        const existing = await prisma_1.prisma.booking.findFirst({
            where: {
                classId,
                memberId
            }
        });
        if (existing) {
            throw new httpError_1.HttpError(409, "Class already booked by this member");
        }
        if (gymClass._count.bookings >= gymClass.maxCapacity) {
            throw new httpError_1.HttpError(400, "Class is at full capacity");
        }
        return prisma_1.prisma.booking.create({
            data: {
                classId,
                memberId
            }
        });
    },
    cancelBooking(classId, memberId) {
        return prisma_1.prisma.booking.delete({
            where: {
                memberId_classId: {
                    memberId,
                    classId
                }
            }
        });
    }
};
//# sourceMappingURL=class.service.js.map
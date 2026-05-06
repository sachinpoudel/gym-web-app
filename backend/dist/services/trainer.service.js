"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trainerService = void 0;
const prisma_1 = require("../config/prisma");
exports.trainerService = {
    create(data) {
        return prisma_1.prisma.trainer.create({ data });
    },
    getAll() {
        return prisma_1.prisma.trainer.findMany({
            include: {
                user: { select: { email: true, role: true } },
                _count: {
                    select: { classes: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });
    },
    async getById(id) {
        const trainer = await prisma_1.prisma.trainer.findUnique({
            where: { id },
            include: {
                user: { select: { email: true, role: true } },
                classes: true
            }
        });
        if (!trainer) {
            return null;
        }
        const classIds = trainer.classes.map((item) => item.id);
        const [bookingCount, attendedCount] = await Promise.all([
            prisma_1.prisma.booking.count({
                where: {
                    classId: { in: classIds }
                }
            }),
            prisma_1.prisma.booking.count({
                where: {
                    classId: { in: classIds },
                    attended: true
                }
            })
        ]);
        return {
            ...trainer,
            stats: {
                classCount: trainer.classes.length,
                bookingCount,
                attendedCount
            }
        };
    },
    update(id, data) {
        return prisma_1.prisma.trainer.update({ where: { id }, data });
    },
    remove(id) {
        return prisma_1.prisma.trainer.delete({ where: { id } });
    }
};
//# sourceMappingURL=trainer.service.js.map
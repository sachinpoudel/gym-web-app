"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.progressService = void 0;
const prisma_1 = require("../config/prisma");
exports.progressService = {
    create(data) {
        return prisma_1.prisma.progress.create({ data });
    },
    getByMemberId(memberId) {
        return prisma_1.prisma.progress.findMany({
            where: { memberId },
            orderBy: { recordedAt: "desc" }
        });
    }
};
//# sourceMappingURL=progress.service.js.map
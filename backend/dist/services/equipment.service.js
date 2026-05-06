"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.equipmentService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../config/prisma");
exports.equipmentService = {
    create(data) {
        return prisma_1.prisma.equipment.create({ data });
    },
    getAll() {
        return prisma_1.prisma.equipment.findMany({
            include: {
                maintenanceLogs: { orderBy: { loggedAt: "desc" } }
            },
            orderBy: { createdAt: "desc" }
        });
    },
    update(id, data) {
        return prisma_1.prisma.equipment.update({ where: { id }, data });
    },
    remove(id) {
        return prisma_1.prisma.equipment.delete({ where: { id } });
    },
    addMaintenanceLog(equipmentId, note) {
        return prisma_1.prisma.maintenanceLog.create({
            data: {
                equipmentId,
                note
            }
        });
    },
    flagNeedsRepair(id) {
        return prisma_1.prisma.equipment.update({
            where: { id },
            data: { condition: client_1.EquipmentCondition.NEEDS_REPAIR }
        });
    }
};
//# sourceMappingURL=equipment.service.js.map
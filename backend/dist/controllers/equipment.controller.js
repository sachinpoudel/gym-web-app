"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.equipmentController = void 0;
const equipment_service_1 = require("../services/equipment.service");
const apiResponse_1 = require("../utils/apiResponse");
const request_1 = require("../utils/request");
exports.equipmentController = {
    async create(req, res) {
        const equipment = await equipment_service_1.equipmentService.create(req.body);
        return (0, apiResponse_1.sendSuccess)(res, equipment, "Equipment created", 201);
    },
    async getAll(_req, res) {
        const equipment = await equipment_service_1.equipmentService.getAll();
        return (0, apiResponse_1.sendSuccess)(res, equipment, "Equipment fetched");
    },
    async update(req, res) {
        const equipment = await equipment_service_1.equipmentService.update((0, request_1.getRequiredParam)(req, "id"), req.body);
        return (0, apiResponse_1.sendSuccess)(res, equipment, "Equipment updated");
    },
    async remove(req, res) {
        await equipment_service_1.equipmentService.remove((0, request_1.getRequiredParam)(req, "id"));
        return (0, apiResponse_1.sendSuccess)(res, null, "Equipment removed");
    },
    async addMaintenanceLog(req, res) {
        const log = await equipment_service_1.equipmentService.addMaintenanceLog((0, request_1.getRequiredParam)(req, "id"), req.body.note);
        return (0, apiResponse_1.sendSuccess)(res, log, "Maintenance log added", 201);
    },
    async flag(req, res) {
        const equipment = await equipment_service_1.equipmentService.flagNeedsRepair((0, request_1.getRequiredParam)(req, "id"));
        return (0, apiResponse_1.sendSuccess)(res, equipment, "Equipment flagged for repair");
    }
};
//# sourceMappingURL=equipment.controller.js.map
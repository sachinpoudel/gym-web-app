"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trainerController = void 0;
const trainer_service_1 = require("../services/trainer.service");
const apiResponse_1 = require("../utils/apiResponse");
const request_1 = require("../utils/request");
exports.trainerController = {
    async create(req, res) {
        const trainer = await trainer_service_1.trainerService.create(req.body);
        return (0, apiResponse_1.sendSuccess)(res, trainer, "Trainer created", 201);
    },
    async getAll(_req, res) {
        const trainers = await trainer_service_1.trainerService.getAll();
        return (0, apiResponse_1.sendSuccess)(res, trainers, "Trainers fetched");
    },
    async getById(req, res) {
        const trainer = await trainer_service_1.trainerService.getById((0, request_1.getRequiredParam)(req, "id"));
        return (0, apiResponse_1.sendSuccess)(res, trainer, "Trainer fetched");
    },
    async update(req, res) {
        const trainer = await trainer_service_1.trainerService.update((0, request_1.getRequiredParam)(req, "id"), req.body);
        return (0, apiResponse_1.sendSuccess)(res, trainer, "Trainer updated");
    },
    async remove(req, res) {
        await trainer_service_1.trainerService.remove((0, request_1.getRequiredParam)(req, "id"));
        return (0, apiResponse_1.sendSuccess)(res, null, "Trainer removed");
    }
};
//# sourceMappingURL=trainer.controller.js.map
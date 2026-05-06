"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCronJobs = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const client_1 = require("@prisma/client");
const prisma_1 = require("../config/prisma");
const expireMemberships = async () => {
    try {
        const now = new Date();
        const result = await prisma_1.prisma.member.updateMany({
            where: {
                expiryDate: { lt: now },
                status: client_1.MemberStatus.ACTIVE
            },
            data: {
                status: client_1.MemberStatus.EXPIRED
            }
        });
        console.log(`[cron] Expired memberships updated: ${result.count}`);
    }
    catch (error) {
        console.error(`[cron] Error expiring memberships:`, error);
    }
};
const logExpiringInSevenDays = async () => {
    try {
        const now = new Date();
        const start = new Date(now);
        start.setDate(start.getDate() + 7);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setHours(23, 59, 59, 999);
        const members = await prisma_1.prisma.member.findMany({
            where: {
                expiryDate: {
                    gte: start,
                    lte: end
                }
            },
            select: {
                firstName: true,
                lastName: true
            }
        });
        const names = members.map((member) => `${member.firstName} ${member.lastName}`);
        console.log(`[cron] Memberships expiring in 7 days (${members.length}): ${names.join(", ")}`);
    }
    catch (error) {
        console.error(`[cron] Error logging expiring memberships:`, error);
    }
};
const startCronJobs = () => {
    node_cron_1.default.schedule("0 0 * * *", () => {
        void expireMemberships();
    });
    node_cron_1.default.schedule("0 9 * * *", () => {
        void logExpiringInSevenDays();
    });
    void expireMemberships();
    void logExpiringInSevenDays();
};
exports.startCronJobs = startCronJobs;
//# sourceMappingURL=cronJobs.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../config/prisma");
const password_1 = require("../utils/password");
const httpError_1 = require("../utils/httpError");
exports.authService = {
    async register({ email, password }) {
        const existing = await prisma_1.prisma.user.findUnique({
            where: { email: email.trim().toLowerCase() },
            include: {
                member: true
            }
        });
        if (!existing || !existing.member) {
            throw new httpError_1.HttpError(404, "Email not found in admitted gym members");
        }
        if (existing.role !== client_1.UserRole.MEMBER) {
            throw new httpError_1.HttpError(403, "Only member accounts can be registered from this form");
        }
        const normalizedEmail = email.trim().toLowerCase();
        const hashedPassword = await (0, password_1.hashPassword)(password);
        const user = await prisma_1.prisma.user.update({
            where: { id: existing.id },
            data: {
                email: normalizedEmail,
                password: hashedPassword
            },
            include: {
                member: true
            }
        });
        return {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            },
            member: user.member
        };
    },
    async login(email, password) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { email },
            include: {
                member: true,
                trainer: true
            }
        });
        if (!user) {
            throw new httpError_1.HttpError(401, "Invalid credentials");
        }
        const isPasswordValid = await (0, password_1.comparePassword)(password, user.password);
        if (!isPasswordValid) {
            throw new httpError_1.HttpError(401, "Invalid credentials");
        }
        return {
            id: user.id,
            email: user.email,
            role: user.role,
            member: user.member,
            trainer: user.trainer
        };
    },
    logout() {
        return {
            success: true
        };
    },
    forgotPassword() {
        return {
            success: true
        };
    },
    async getUserById(userId) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
                member: true,
                trainer: true,
                createdAt: true,
                updatedAt: true
            }
        });
        if (!user?.member) {
            return user;
        }
        const daysLeft = Math.max(0, Math.ceil((user.member.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
        return {
            ...user,
            member: {
                ...user.member,
                daysLeft
            }
        };
    }
};
//# sourceMappingURL=auth.service.js.map
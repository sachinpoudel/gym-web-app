import { MemberPlan, MemberStatus, PaymentMethod, PaymentStatus, Prisma, UserRole } from "@prisma/client";
import { randomUUID } from "crypto";
import { prisma } from "../config/prisma";
import { hashPassword } from "../utils/password";
import { HttpError } from "../utils/httpError";

interface GetAllFilters {
  status?: MemberStatus;
  plan?: "BASIC" | "PRO" | "ELITE";
  search?: string;
  page: number;
  limit: number;
}

interface CreateMemberOnboardingInput {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: Date;
  plan: MemberPlan;
  joinDate: Date;
  expiryDate: Date;
  status: MemberStatus;
  emergencyContact?: string;
  healthNotes?: string;
  paymentAmount: number;
  paymentMethod: PaymentMethod;
}

const createTemporaryPassword = (): string => {
  return `Temp#${randomUUID().replace(/-/g, "")}`;
};

export const memberService = {
  async createOnboarding(data: CreateMemberOnboardingInput) {
    if (!Number.isFinite(data.paymentAmount) || data.paymentAmount < 0) {
      throw new HttpError(400, "Payment amount must be a non-negative number");
    }

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new HttpError(409, "Email already in use");
    }

     const temporaryPasswordHash = await hashPassword(createTemporaryPassword());

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: temporaryPasswordHash,
          role: UserRole.MEMBER
        }
      });

      const member = await tx.member.create({
        data: {
          userId: user.id,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          dateOfBirth: data.dateOfBirth,
          plan: data.plan,
          status: data.status,
          joinDate: data.joinDate,
          expiryDate: data.expiryDate,
          ...(data.emergencyContact ? { emergencyContact: data.emergencyContact } : {}),
          ...(data.healthNotes ? { healthNotes: data.healthNotes } : {}),
          qrCode: randomUUID()
        }
      });

      const payment = await tx.payment.create({
        data: {
          memberId: member.id,
          amount: data.paymentAmount,
          plan: data.plan,
          method: data.paymentMethod,
          status: PaymentStatus.PAID,
          paidAt: new Date(),
          dueDate: data.expiryDate
        }
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        },
        member,
        payment
      };
    });
  },

  async getAll(filters: GetAllFilters) {
    const { status, plan, search, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.MemberWhereInput = {
      ...(status ? { status } : {}),
      ...(plan ? { plan } : {}),
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
              { user: { email: { contains: search, mode: "insensitive" } } }
            ]
          }
        : {})
    };

    const [total, data] = await Promise.all([
      prisma.member.count({ where }),
      prisma.member.findMany({
        where,
        include: {
          user: { select: { email: true, role: true } }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      })
    ]);

    const mapped = data.map((member) => {
      const daysToExpiry = Math.ceil(
        (member.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      return {
        ...member,
        daysToExpiry,
        isExpiringSoon: daysToExpiry >= 0 && daysToExpiry <= 7
      };
    });

    return { total, data: mapped };
  },

  getExpiringInDays(days: number) {
    const now = new Date();
    const end = new Date(now);
    end.setDate(end.getDate() + days);

    return prisma.member.findMany({
      where: {
        expiryDate: {
          gte: now,
          lte: end
        }
      },
      include: {
        user: { select: { email: true, role: true } }
      },
      orderBy: { expiryDate: "asc" }
    });
  },

  getById(id: string) {
    return prisma.member.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, role: true } },
        payments: true,
        progress: true,
        attendance: true,
        bookings: { include: { gymClass: true } }
      }
    });
  },

  update(id: string, data: Prisma.MemberUncheckedUpdateInput) {
    return prisma.member.update({ where: { id }, data });
  },

  updateStatus(id: string, status: MemberStatus) {
    return prisma.member.update({
      where: { id },
      data: { status }
    });
  },

  remove(id: string) {
    return prisma.member.update({
      where: { id },
      data: { status: MemberStatus.EXPIRED }
    });
  },

  freeze(id: string) {
    return prisma.member.update({
      where: { id },
      data: { status: MemberStatus.FROZEN }
    });
  },

  activate(id: string) {
    return prisma.member.update({
      where: { id },
      data: { status: MemberStatus.ACTIVE }
    });
  },

  async getStats(memberId: string) {
    const [checkInCount, classesAttended, paymentSummary] = await Promise.all([
      prisma.attendance.count({ where: { memberId } }),
      prisma.booking.count({ where: { memberId, attended: true } }),
      prisma.payment.groupBy({
        by: ["status"],
        where: { memberId },
        _sum: { amount: true },
        _count: { _all: true }
      })
    ]);

    return {
      checkInCount,
      classesAttended,
      paymentSummary
    };
  }
};

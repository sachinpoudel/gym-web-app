import { MemberPlan, MemberStatus, PaymentMethod, PaymentStatus, Prisma, UserRole } from "@prisma/client";
import { randomUUID } from "crypto";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { hashPassword } from "../utils/password";
import { HttpError } from "../utils/httpError";

interface GetAllFilters {
  status?: MemberStatus;
  plan?: "BASIC" | "PRO" | "ELITE";
  search?: string;
  expiringSoon?: boolean;
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

interface RenewMembershipInput {
  memberId: string;
  plan: MemberPlan;
  paymentAmount: number;
  paymentMethod: PaymentMethod;
  renewalStart?: Date;
}

const PLAN_MONTHS: Record<MemberPlan, number> = {
  BASIC: 1,
  PRO: 3,
  ELITE: 12
};

const addPlanMonths = (start: Date, plan: MemberPlan) => {
  const date = new Date(start);
  date.setMonth(date.getMonth() + PLAN_MONTHS[plan]);
  return date;
};

const createTemporaryPassword = (): string => {
  return `Temp#${randomUUID().replace(/-/g, "")}`;
};

const withDaysLeft = <T extends { expiryDate: Date }>(member: T) => {
  if (!member || !member.expiryDate) return member;
  const daysLeft = Math.ceil((member.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return { ...member, daysLeft };
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
        member: withDaysLeft(member),
        payment
      };
    });
  },

  async getAll(filters: GetAllFilters) {
    const { status, plan, search, expiringSoon, page, limit } = filters;
    const skip = (page - 1) * limit;
    const start = Date.now();

    const now = new Date();
    const expiringEnd = new Date(now);
    expiringEnd.setDate(expiringEnd.getDate() + 7);

    const where: Prisma.MemberWhereInput = {
      ...(status ? { status } : {}),
      ...(plan ? { plan } : {}),
      ...(expiringSoon
        ? {
            status: MemberStatus.ACTIVE,
            expiryDate: {
              gte: now,
              lte: expiringEnd
            }
          }
        : {}),
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

    if (env.nodeEnv !== "production") {
      const totalMs = Date.now() - start;
      console.info(`[members.getAll] total=${totalMs}ms count=${total} page=${page} limit=${limit}`);
    }

    const mapped = data.map((member) => {
      const daysLeft = Math.ceil(
        (member.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      return {
        ...member,
        daysLeft,
        isExpiringSoon: daysLeft >= 0 && daysLeft <= 7
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
    }).then(members => members.map(withDaysLeft));
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
    }).then(member => member ? withDaysLeft(member) : null);
  },

  update(id: string, data: Prisma.MemberUncheckedUpdateInput) {
    return prisma.member.update({ where: { id }, data }).then(withDaysLeft);
  },

  updateStatus(id: string, status: MemberStatus) {
    return prisma.member.update({
      where: { id },
      data: { status }
    }).then(withDaysLeft);
  },

  remove(id: string) {
    return prisma.$transaction(async (tx) => {
      const member = await tx.member.findUnique({ where: { id } });
      if (!member) return null;

      // Manually cascade delete
      await tx.attendance.deleteMany({ where: { memberId: id } });
      await tx.payment.deleteMany({ where: { memberId: id } });
      await tx.progress.deleteMany({ where: { memberId: id } });
      await tx.booking.deleteMany({ where: { memberId: id } });

      const deletedMember = await tx.member.delete({ where: { id } });
      await tx.user.delete({ where: { id: member.userId } });

      return withDaysLeft(deletedMember);
    });
  },

  freeze(id: string) {
    return prisma.member.update({
      where: { id },
      data: { status: MemberStatus.FROZEN }
    }).then(withDaysLeft);
  },

  activate(id: string) {
    return prisma.member.update({
      where: { id },
      data: { status: MemberStatus.ACTIVE }
    }).then(withDaysLeft);
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
  },

  async renewMembership({ memberId, plan, paymentAmount, paymentMethod, renewalStart }: RenewMembershipInput) {
    if (!Number.isFinite(paymentAmount) || paymentAmount < 0) {
      throw new HttpError(400, "Payment amount must be a non-negative number");
    }

    const member = await prisma.member.findUnique({ where: { id: memberId } });
    if (!member) {
      throw new HttpError(404, "Member not found");
    }

    const today = new Date();
    const baseDate = renewalStart
      ? renewalStart
      : member.expiryDate > today
        ? member.expiryDate
        : today;
    const newExpiryDate = addPlanMonths(baseDate, plan);

    return prisma.$transaction(async (tx) => {
      const updatedMember = await tx.member.update({
        where: { id: memberId },
        data: {
          plan,
          expiryDate: newExpiryDate,
          status: MemberStatus.ACTIVE
        }
      });

      const payment = await tx.payment.create({
        data: {
          memberId,
          amount: paymentAmount,
          plan,
          method: paymentMethod,
          status: PaymentStatus.PAID,
          paidAt: new Date(),
          dueDate: newExpiryDate
        }
      });

      return {
        member: withDaysLeft(updatedMember),
        payment
      };
    });
  }
};

import { PaymentStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export const paymentService = {
  create(data: Prisma.PaymentUncheckedCreateInput) {
    return prisma.payment.create({ data });
  },

  getAll(filters?: { status?: PaymentStatus; memberId?: string }) {
    return prisma.payment.findMany({
      where: {
        ...(filters?.status ? { status: filters.status } : {}),
        ...(filters?.memberId ? { memberId: filters.memberId } : {})
      },
      include: { member: true },
      orderBy: { createdAt: "desc" }
    });
  },

  getByMemberId(memberId: string) {
    return prisma.payment.findMany({
      where: { memberId },
      orderBy: { createdAt: "desc" }
    });
  },

  updateStatus(id: string, status: PaymentStatus) {
    return prisma.payment.update({
      where: { id },
      data: {
        status,
        paidAt: status === PaymentStatus.PAID ? new Date() : null
      }
    });
  },

  markPaid(id: string) {
    return prisma.payment.update({
      where: { id },
      data: {
        status: PaymentStatus.PAID,
        paidAt: new Date()
      }
    });
  },

  async getSummary() {
    const now = new Date();

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const [today, week, month, year] = await Promise.all([
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: PaymentStatus.PAID,
          paidAt: { gte: todayStart }
        }
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: PaymentStatus.PAID,
          paidAt: { gte: weekStart }
        }
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: PaymentStatus.PAID,
          paidAt: { gte: monthStart }
        }
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: PaymentStatus.PAID,
          paidAt: { gte: yearStart }
        }
      })
    ]);

    return {
      today: today._sum.amount ?? 0,
      week: week._sum.amount ?? 0,
      month: month._sum.amount ?? 0,
      year: year._sum.amount ?? 0
    };
  },

  async getMonthlyTotals() {
    const rows = await prisma.$queryRaw<Array<{ month: Date; total: number }>>`
      SELECT DATE_TRUNC('month', "paidAt") as month,
             SUM("amount") as total
      FROM "Payment"
      WHERE "status" = 'PAID' AND "paidAt" IS NOT NULL
      GROUP BY month
      ORDER BY month ASC
    `;

    return rows.map((row) => ({
      month: row.month,
      total: Number(row.total)
    }));
  },

  async getYearlyTotals() {
    const rows = await prisma.$queryRaw<Array<{ year: Date; total: number }>>`
      SELECT DATE_TRUNC('year', "paidAt") as year,
             SUM("amount") as total
      FROM "Payment"
      WHERE "status" = 'PAID' AND "paidAt" IS NOT NULL
      GROUP BY year
      ORDER BY year ASC
    `;

    return rows.map((row) => ({
      year: row.year,
      total: Number(row.total)
    }));
  },

  getOverdue() {
    return prisma.payment.findMany({
      where: {
        status: PaymentStatus.OVERDUE
      },
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            user: { select: { email: true } }
          }
        }
      },
      orderBy: { dueDate: "asc" }
    });
  },

  sendReminder(id: string) {
    console.log(`[payments] reminder sent for payment ${id}`);
    return {
      success: true
    };
  }
};

import cron from "node-cron";
import { MemberStatus } from "@prisma/client";
import { prisma } from "../config/prisma";

const expireMemberships = async (): Promise<void> => {
  try {
    const now = new Date();

    const result = await prisma.member.updateMany({
      where: {
        expiryDate: { lt: now },
        status: MemberStatus.ACTIVE
      },
      data: {
        status: MemberStatus.EXPIRED
      }
    });

    console.log(`[cron] Expired memberships updated: ${result.count}`);
  } catch (error) {
    console.error(`[cron] Error expiring memberships:`, error);
  }
};


  cron.schedule("*/4 * * * *", async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log("[cron] Neon keepalive ✓");
    } catch (e) {
      console.error("[cron] Neon keepalive failed:", e);
    }
  });


const logExpiringInSevenDays = async (): Promise<void> => {
  try {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() + 7);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setHours(23, 59, 59, 999);

    const members = await prisma.member.findMany({
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
  } catch (error) {
    console.error(`[cron] Error logging expiring memberships:`, error);
  }
};

export const startCronJobs = (): void => {
  cron.schedule("0 0 * * *", () => {
    void expireMemberships();
  });

  cron.schedule("0 9 * * *", () => {
    void logExpiringInSevenDays();
  });

  void expireMemberships();
  void logExpiringInSevenDays();
};

import { cookies } from "next/headers";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Card from "@/components/ui/Card";
import MemberGrowthChart from "@/components/charts/MemberGrowthChart";
import PlanDistributionChart from "@/components/charts/PlanDistributionChart";
import ExpiryChart from "@/components/charts/ExpiryChart";
import { getMembers } from "@/lib/api";
import type { ChartPoint, Member, PlanDistributionPoint } from "@/types";

// Always render fresh — never serve a cached version
export const dynamic = "force-dynamic";
export const revalidate = 0;

const getStatus = (member: Member) => {
  if (typeof member.daysLeft !== "number") {
    throw new Error("Critical data missing: daysLeft must be provided by the backend");
  }
  const daysLeft = member.daysLeft;
  if (member.status === "FROZEN") return "FROZEN";
  if (daysLeft < 0 || member.status === "EXPIRED") return "EXPIRED";
  if (daysLeft <= 7) return "Expiring Soon";
  return "ACTIVE";
};

const buildMonthlyGrowth = (members: Member[]): ChartPoint[] => {
  const now = new Date();
  const months: { key: string; label: string }[] = [];

  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = date.toLocaleString("en-US", { month: "short" });
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    months.push({ key, label });
  }

  const counts = new Map<string, number>();
  months.forEach((month) => counts.set(month.key, 0));

  members.forEach((member) => {
    const source = member.joinDate || member.createdAt;
    const date = new Date(source);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    if (counts.has(key)) {
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  });

  return months.map((month) => ({
    label: month.label,
    value: counts.get(month.key) || 0,
  }));
};

const buildPlanDistribution = (members: Member[]): PlanDistributionPoint[] => {
  const counts: Record<string, number> = {
    BASIC: 0,
    PRO: 0,
    ELITE: 0,
  };

  members.forEach((member) => {
    if (counts[member.plan] !== undefined) {
      counts[member.plan] += 1;
    }
  });

  return Object.entries(counts).map(([name, value]) => ({
    name: name as PlanDistributionPoint["name"],
    value,
  }));
};

const buildExpiryTimeline = (members: Member[]): ChartPoint[] => {
  const buckets = [
    { label: "7 days", limit: 7, value: 0 },
    { label: "14 days", limit: 14, value: 0 },
    { label: "30 days", limit: 30, value: 0 },
  ];

  members.forEach((member) => {
    if (typeof member.daysLeft !== "number") {
      throw new Error("Critical data missing: daysLeft must be provided by the backend");
    }
    const daysLeft = member.daysLeft;
    buckets.forEach((bucket) => {
      if (daysLeft >= 0 && daysLeft <= bucket.limit) {
        bucket.value += 1;
      }
    });
  });

  return buckets.map((bucket) => ({ label: bucket.label, value: bucket.value }));
};

export default async function DashboardPage() {
  const token = cookies().get("admin_token")?.value;
  const response = await getMembers(token);

  if (!response.success || !response.data) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="rounded-lg border border-black/10 bg-white p-6 text-sm text-black">
          Failed to load dashboard data. Try again.
        </div>
      </DashboardLayout>
    );
  }

  const members = response.data;
  const totalMembers = members.length;
  const activeMembers = members.filter((member) => getStatus(member) === "ACTIVE").length;
  const expiredMembers = members.filter((member) => getStatus(member) === "EXPIRED").length;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const newMembersThisMonth = members.filter((member) => {
    const date = new Date(member.joinDate || member.createdAt);
    return date >= startOfMonth;
  }).length;

  const growthData = buildMonthlyGrowth(members);
  const planData = buildPlanDistribution(members);
  const expiryData = buildExpiryTimeline(members);

  return (
    <DashboardLayout title="Dashboard">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <div className="text-xs uppercase text-black/50">Total Members</div>
          <div className="mt-3 text-2xl font-semibold text-black">{totalMembers}</div>
        </Card>
        <Card>
          <div className="text-xs uppercase text-black/50">Active Members</div>
          <div className="mt-3 text-2xl font-semibold text-black">{activeMembers}</div>
        </Card>
        <Card>
          <div className="text-xs uppercase text-black/50">Expired / Inactive</div>
          <div className="mt-3 text-2xl font-semibold text-black">{expiredMembers}</div>
        </Card>
        <Card>
          <div className="text-xs uppercase text-black/50">New This Month</div>
          <div className="mt-3 text-2xl font-semibold text-black">
            {newMembersThisMonth}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <div className="mb-4 text-sm font-semibold text-black">
            Member Growth Over Time
          </div>
          <MemberGrowthChart data={growthData} />
        </Card>
        <Card>
          <div className="mb-4 text-sm font-semibold text-black">
            Plan Distribution
          </div>
          <PlanDistributionChart data={planData} />
        </Card>
        <Card>
          <div className="mb-4 text-sm font-semibold text-black">
            Expiry Timeline
          </div>
          <ExpiryChart data={expiryData} />
        </Card>
      </div>
    </DashboardLayout>
  );
}

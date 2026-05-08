import { cookies } from "next/headers";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Card from "@/components/ui/Card";
import { Table, TableWrapper } from "@/components/ui/Table";
import MemberGrowthChart from "@/components/charts/MemberGrowthChart";
import PlanDistributionChart from "@/components/charts/PlanDistributionChart";
import ExpiryChart from "@/components/charts/ExpiryChart";
import { getOverduePayments, getReportsOverview } from "@/lib/api";
import type { ChartPoint, OverduePayment, ReportOverviewAlerts, ReportOverviewTrends } from "@/types";

// Always render fresh — never serve a cached version
export const dynamic = "force-dynamic";
export const revalidate = 0;

const formatMonthLabel = (date: Date) => {
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear().toString().slice(-2);
  return `${month} '${year}`;
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount || 0);

const buildMonthlySeries = <T,>(
  rows: T[],
  getDate: (row: T) => string,
  getValue: (row: T) => number
): ChartPoint[] => {
  const now = new Date();
  const months: Array<{ key: string; label: string }> = [];

  for (let i = 11; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    months.push({ key, label: formatMonthLabel(date) });
  }

  const map = new Map<string, number>();
  rows.forEach((row) => {
    const date = new Date(getDate(row));
    if (Number.isNaN(date.getTime())) return;
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    map.set(key, (map.get(key) || 0) + getValue(row));
  });

  return months.map((month) => ({
    label: month.label,
    value: map.get(month.key) || 0,
  }));
};

const buildGrowthChart = (trends: ReportOverviewTrends): ChartPoint[] =>
  buildMonthlySeries(
    trends.memberGrowthLast12Months,
    (entry) => entry.month,
    (entry) => entry.count
  );

const buildRevenueChart = (trends: ReportOverviewTrends): ChartPoint[] =>
  buildMonthlySeries(
    trends.revenueLast12Months,
    (entry) => entry.period,
    (entry) => entry.total
  );

const buildExpiryTimeline = (alerts: ReportOverviewAlerts): ChartPoint[] => {
  const now = new Date();
  const buckets = [
    { label: "0-3 days", min: 0, max: 3, value: 0 },
    { label: "4-7 days", min: 4, max: 7, value: 0 },
  ];

  alerts.expiringSoonMembers.forEach((member) => {
    const expiryDate = new Date(member.expiryDate);
    const diff = expiryDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
    buckets.forEach((bucket) => {
      if (daysLeft >= bucket.min && daysLeft <= bucket.max) {
        bucket.value += 1;
      }
    });
  });

  return buckets.map((bucket) => ({ label: bucket.label, value: bucket.value }));
};

export default async function DashboardPage() {
  const token = cookies().get("admin_token")?.value;
  const [overviewResponse, overdueResponse] = await Promise.all([
    getReportsOverview(token),
    getOverduePayments(token),
  ]);

  if (!overviewResponse.success || !overviewResponse.data) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="rounded-lg border border-black/10 bg-white p-6 text-sm text-black">
          Failed to load dashboard data. Try again.
        </div>
      </DashboardLayout>
    );
  }

  const overview = overviewResponse.data;
  const overduePayments: OverduePayment[] =
    overdueResponse.success && overdueResponse.data ? overdueResponse.data : [];
  const { stats, trends, alerts } = overview;
  const growthData = buildGrowthChart(trends);
  const revenueData = buildRevenueChart(trends);
  const planData = trends.planDistribution;
  const expiryData = buildExpiryTimeline(alerts);

  return (
    <DashboardLayout title="Dashboard">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 via-white to-white">
          <div className="text-xs uppercase text-black/50">Total Members</div>
          <div className="mt-3 text-2xl font-semibold text-black">{stats.totalMembers}</div>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 via-white to-white">
          <div className="text-xs uppercase text-black/50">Active Members</div>
          <div className="mt-3 text-2xl font-semibold text-black">{stats.activeMembers}</div>
        </Card>
        <Card className="bg-gradient-to-br from-slate-50 via-white to-white">
          <div className="text-xs uppercase text-black/50">Frozen Members</div>
          <div className="mt-3 text-2xl font-semibold text-black">{stats.frozenMembers}</div>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 via-white to-white">
          <div className="text-xs uppercase text-black/50">New This Month</div>
          <div className="mt-3 text-2xl font-semibold text-black">
            {stats.newMembersThisMonth}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-rose-50 via-white to-white">
          <div className="text-xs uppercase text-black/50">Expired Members</div>
          <div className="mt-3 text-2xl font-semibold text-black">{stats.expiredMembers}</div>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 via-white to-white">
          <div className="text-xs uppercase text-black/50">Expiring in 7 Days</div>
          <div className="mt-3 text-2xl font-semibold text-black">
            {stats.expiringIn7Days}
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 via-white to-white">
          <div className="text-xs uppercase text-black/50">Overdue Payments</div>
          <div className="mt-3 text-2xl font-semibold text-black">
            {alerts.overduePaymentsCount}
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 via-white to-white">
          <div className="text-xs uppercase text-black/50">Revenue Today</div>
          <div className="mt-3 text-2xl font-semibold text-black">
            {formatCurrency(stats.revenueToday)}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-emerald-50 via-white to-white">
          <div className="text-xs uppercase text-black/50">Revenue This Month</div>
          <div className="mt-3 text-2xl font-semibold text-black">
            {formatCurrency(stats.revenueThisMonth)}
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-cyan-50 via-white to-white">
          <div className="text-xs uppercase text-black/50">Revenue Last Month</div>
          <div className="mt-3 text-2xl font-semibold text-black">
            {formatCurrency(stats.revenueLastMonth)}
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-violet-50 via-white to-white">
          <div className="text-xs uppercase text-black/50">Revenue This Year</div>
          <div className="mt-3 text-2xl font-semibold text-black">
            {formatCurrency(stats.revenueThisYear)}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="bg-white/90">
          <div className="mb-4 text-sm font-semibold text-black">
            Member Growth Over Time
          </div>
          <MemberGrowthChart
            data={growthData}
            color="#2563eb"
            gradientFrom="rgba(37, 99, 235, 0.35)"
            gradientTo="rgba(37, 99, 235, 0.05)"
          />
        </Card>
        <Card className="bg-white/90">
          <div className="mb-4 text-sm font-semibold text-black">
            Revenue Trend (12 Months)
          </div>
          <MemberGrowthChart
            data={revenueData}
            color="#10b981"
            gradientFrom="rgba(16, 185, 129, 0.35)"
            gradientTo="rgba(16, 185, 129, 0.05)"
            valueFormat="compact"
          />
        </Card>
        <Card className="bg-white/90">
          <div className="mb-4 text-sm font-semibold text-black">
            Plan Distribution
          </div>
          <PlanDistributionChart data={planData} />
        </Card>
        <Card className="bg-white/90">
          <div className="mb-4 text-sm font-semibold text-black">
            Expiry Timeline (Next 7 Days)
          </div>
          <ExpiryChart data={expiryData} />
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 text-sm font-semibold text-black">Expiring Soon</div>
          <TableWrapper>
            <Table>
              <thead>
                <tr className="text-left text-xs uppercase text-black/50">
                  <th className="px-4 py-3">Member</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Expiry Date</th>
                </tr>
              </thead>
              <tbody>
                {alerts.expiringSoonMembers.slice(0, 5).map((member) => (
                  <tr key={member.id} className="border-t border-black/10">
                    <td className="px-4 py-3 text-sm text-black">
                      {member.firstName} {member.lastName}
                    </td>
                    <td className="px-4 py-3 text-sm text-black/70">
                      {member.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-black">
                      {new Date(member.expiryDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
                {alerts.expiringSoonMembers.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-6 text-center text-sm text-black/60"
                    >
                      No memberships expiring in the next 7 days.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </TableWrapper>
        </Card>
        <Card>
          <div className="mb-4 text-sm font-semibold text-black">Overdue Payments</div>
          <TableWrapper>
            <Table>
              <thead>
                <tr className="text-left text-xs uppercase text-black/50">
                  <th className="px-4 py-3">Member</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {overduePayments.slice(0, 5).map((payment) => (
                  <tr key={payment.id} className="border-t border-black/10">
                    <td className="px-4 py-3 text-sm text-black">
                      {payment.member.firstName} {payment.member.lastName}
                    </td>
                    <td className="px-4 py-3 text-sm text-black">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-black">
                      {new Date(payment.dueDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
                {overduePayments.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-6 text-center text-sm text-black/60"
                    >
                      No overdue payments right now.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </TableWrapper>
        </Card>
      </div>
    </DashboardLayout>
  );
}

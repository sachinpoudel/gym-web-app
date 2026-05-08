export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message?: string;
}

// These match the Prisma enums in the backend
export type MemberPlan = "BASIC" | "PRO" | "ELITE";
export type MemberStatus = "ACTIVE" | "EXPIRED" | "FROZEN";
export type PaymentMethod = "CASH" | "CARD" | "ONLINE";
export type PaymentStatus = "PAID" | "PENDING" | "OVERDUE" | "FAILED";

export interface Member {
  id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  emergencyContact?: string;
  healthNotes?: string;
  plan: MemberPlan;
  joinDate: string;
  expiryDate: string;
  daysLeft: number;
  status: MemberStatus | "Expiring Soon";
  createdAt: string;
}

export interface Admin {
  id: string;
  email: string;
  name: string;
  token: string;
}

export interface CreateMemberPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  plan: MemberPlan;
  joinDate?: string;
  expiryDate?: string;
  paymentAmount: number;
  paymentMethod: PaymentMethod;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  healthNotes?: string;
}

export type MemberUpdateData = Partial<Omit<CreateMemberPayload, "paymentAmount" | "paymentMethod">>;

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  expiredMembers: number;
  newMembersThisMonth: number;
}

export interface MemberListResponse {
  total: number;
  data: Member[];
}

export interface ChartPoint {
  label: string;
  value: number;
}

export interface PlanDistributionPoint {
  name: MemberPlan;
  value: number;
}

export interface Payment {
  id: string;
  memberId: string;
  amount: number;
  plan: MemberPlan;
  status: PaymentStatus;
  method: PaymentMethod;
  paidAt?: string | null;
  dueDate: string;
  createdAt: string;
}

export interface OverduePayment {
  id: string;
  amount: number;
  dueDate: string;
  status: PaymentStatus;
  member: {
    firstName: string;
    lastName: string;
    phone: string;
    user: { email: string };
  };
}

export interface RenewMemberPayload {
  plan: MemberPlan;
  paymentAmount: number;
  paymentMethod: PaymentMethod;
  renewalStart?: string;
}

export interface RenewMemberResponse {
  member: Member;
  payment: Payment;
}

export interface ReportOverviewStats {
  totalMembers: number;
  activeMembers: number;
  expiredMembers: number;
  frozenMembers: number;
  newMembersThisMonth: number;
  expiringIn7Days: number;
  revenueThisMonth: number;
  revenueToday: number;
  revenueThisYear: number;
  revenueLastMonth: number;
}

export interface ReportOverviewTrends {
  revenueLast12Months: Array<{ period: string; total: number }>;
  memberGrowthLast12Months: Array<{ month: string; count: number }>;
  planDistribution: PlanDistributionPoint[];
}

export interface ReportOverviewAlerts {
  expiringSoonMembers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    expiryDate: string;
  }>;
  overduePaymentsCount: number;
}

export interface ReportOverview {
  stats: ReportOverviewStats;
  trends: ReportOverviewTrends;
  alerts: ReportOverviewAlerts;
}

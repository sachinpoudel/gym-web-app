export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message?: string;
}

// These match the Prisma enums in the backend
export type MemberPlan = "BASIC" | "PRO" | "ELITE";
export type MemberStatus = "ACTIVE" | "EXPIRED" | "FROZEN";
export type PaymentMethod = "CASH" | "CARD" | "ONLINE";

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

export interface ChartPoint {
  label: string;
  value: number;
}

export interface PlanDistributionPoint {
  name: MemberPlan;
  value: number;
}

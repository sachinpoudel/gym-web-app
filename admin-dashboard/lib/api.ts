import { authHeader } from "@/lib/auth";
import type {
  Admin,
  ApiResponse,
  CreateMemberPayload,
  Member,
  MemberListResponse,
  MemberUpdateData,
  OverduePayment,
  ReportOverview,
  RenewMemberPayload,
  RenewMemberResponse
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const parseJson = async (response: Response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const request = async <T>(
  path: string,
  options?: RequestInit & { token?: string }
): Promise<ApiResponse<T>> => {
  const url = `${API_BASE}${path}`;
  const headers = new Headers(options?.headers);
  const authHeaders = authHeader(options?.token);
  Object.entries(authHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  const response = await fetch(url, { ...options, headers, cache: "no-store" });
  const payload = await parseJson(response);

  if (!response.ok) {
    return {
      success: false,
      data: null,
      message: payload?.message || response.statusText || "Request failed",
    };
  }

  return {
    success: true,
    data: (payload?.data ?? payload) as T,
    message: payload?.message,
  };
};

export const adminLogin = (email: string, password: string) =>
  request<Admin>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    headers: { "Content-Type": "application/json" },
  });

export const getMembers = async (token?: string, params?: Record<string, string>) => {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return request<MemberListResponse>(`/api/members${query}`, { token });
};

export const getMemberById = (id: string, token?: string) =>
  request<Member>(`/api/members/${id}`, { token });

export const createMember = (data: CreateMemberPayload, token?: string) =>
  request<Member>("/api/members/create", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
    token,
  });

export const updateMember = (id: string, data: MemberUpdateData, token?: string) =>
  request<Member>(`/api/members/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
    token,
  });

export const deleteMember = (id: string, token?: string) =>
  request<{ id: string }>(`/api/members/${id}`, {
    method: "DELETE",
    token,
  });

export const freezeMember = (id: string, token?: string) =>
  request<Member>(`/api/members/${id}/freeze`, { method: "PATCH", token });

export const activateMember = (id: string, token?: string) =>
  request<Member>(`/api/members/${id}/activate`, { method: "PATCH", token });

export const getReportsOverview = (token?: string) =>
  request<ReportOverview>("/api/reports/overview", { token });

export const renewMember = (id: string, payload: RenewMemberPayload, token?: string) =>
  request<RenewMemberResponse>(`/api/members/${id}/renew`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
    token,
  });

export const getOverduePayments = (token?: string) =>
  request<OverduePayment[]>("/api/payments/overdue", { token });

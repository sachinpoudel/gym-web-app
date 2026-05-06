"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { updateMember } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import type { Member, MemberPlan, MemberUpdateData } from "@/types";

const PLAN_LABEL: Record<MemberPlan, string> = {
  BASIC: "Basic (1 month)",
  PRO: "Pro (3 months)",
  ELITE: "Elite (12 months)",
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  EXPIRED: "bg-red-100 text-red-600",
  FROZEN: "bg-sky-100 text-sky-700",
};

const fmtDate = (iso: string) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

export default function MemberProfile({ member }: { member: Member }) {
  const searchParams = useSearchParams();
  const [memberState, setMemberState] = useState(member);
  const [editing, setEditing] = useState(searchParams.get("mode") === "edit");
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState<MemberUpdateData>({
    firstName: member.firstName || "",
    lastName: member.lastName || "",
    phone: member.phone || "",
    dateOfBirth: member.dateOfBirth || "",
    plan: member.plan,
    expiryDate: member.expiryDate || "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    healthNotes: member.healthNotes || "",
  });

  const set = (key: string, value: string) =>
    setEditForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const token = getAuthToken() || undefined;
    const res = await updateMember(member.id, editForm, token);
    if (!res.success || !res.data) {
      setError(res.message || "Failed to update member.");
      setSaving(false);
      return;
    }
    setMemberState(res.data);
    setEditing(false);
    setToast("Member updated successfully!");
    setTimeout(() => setToast(null), 3000);
    setSaving(false);
  };

  const inputCls =
    "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 bg-white transition";
  const labelCls = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500";

  const fullName =
    memberState.fullName ||
    [memberState.firstName, memberState.lastName].filter(Boolean).join(" ") ||
    "—";

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed right-6 top-6 z-50 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-xl font-bold text-indigo-700">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{fullName}</h2>
              <p className="text-sm text-gray-500">{memberState.email}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[memberState.status as string] ?? "bg-gray-100 text-gray-600"
              }`}
          >
            {memberState.status}
          </span>
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
            {PLAN_LABEL[memberState.plan as MemberPlan] ?? memberState.plan}
          </span>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            {memberState.daysLeft >= 0
              ? `${memberState.daysLeft} days left`
              : "Expired"}
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {editing ? (
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>First Name</label>
              <input className={inputCls} value={editForm.firstName || ""} onChange={(e) => set("firstName", e.target.value)} required />
            </div>
            <div>
              <label className={labelCls}>Last Name</label>
              <input className={inputCls} value={editForm.lastName || ""} onChange={(e) => set("lastName", e.target.value)} required />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Phone</label>
              <input type="tel" className={inputCls} value={editForm.phone || ""} onChange={(e) => set("phone", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Date of Birth</label>
              <input type="date" className={inputCls} value={editForm.dateOfBirth || ""} onChange={(e) => set("dateOfBirth", e.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Membership Plan</label>
              <select className={inputCls} value={editForm.plan || "BASIC"} onChange={(e) => set("plan", e.target.value)}>
                <option value="BASIC">Basic (1 month)</option>
                <option value="PRO">Pro (3 months)</option>
                <option value="ELITE">Elite (12 months)</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Expiry Date</label>
              <input type="date" className={inputCls} value={editForm.expiryDate || ""} onChange={(e) => set("expiryDate", e.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Emergency Contact Name</label>
              <input className={inputCls} value={editForm.emergencyContactName || ""} onChange={(e) => set("emergencyContactName", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Emergency Contact Phone</label>
              <input type="tel" className={inputCls} value={editForm.emergencyContactPhone || ""} onChange={(e) => set("emergencyContactPhone", e.target.value)} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Health Notes</label>
            <textarea className={inputCls} rows={3} value={editForm.healthNotes || ""} onChange={(e) => set("healthNotes", e.target.value)} />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setEditing(false)} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Phone", value: memberState.phone },
              { label: "Date of Birth", value: fmtDate(memberState.dateOfBirth || "") },
              { label: "Plan", value: PLAN_LABEL[memberState.plan as MemberPlan] ?? memberState.plan },
              { label: "Joined", value: fmtDate(memberState.joinDate) },
              { label: "Expires", value: fmtDate(memberState.expiryDate) },
              { label: "Days Left", value: memberState.daysLeft >= 0 ? `${memberState.daysLeft} days` : "Expired" },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</div>
                <div className="mt-1.5 text-sm font-medium text-gray-800">{value || "—"}</div>
              </div>
            ))}
          </div>

          {memberState.emergencyContact && (
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-amber-600">Emergency Contact</div>
              <div className="mt-1.5 text-sm font-medium text-gray-800">{memberState.emergencyContact}</div>
            </div>
          )}

          {memberState.healthNotes && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-blue-600">Health Notes</div>
              <div className="mt-1.5 text-sm text-gray-700">{memberState.healthNotes}</div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <Link href="/members" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
              ← Back to Members
            </Link>
            <button
              onClick={() => setEditing(true)}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              Edit Member
            </button>
          </div>
        </>
      )}
    </div>
  );
}

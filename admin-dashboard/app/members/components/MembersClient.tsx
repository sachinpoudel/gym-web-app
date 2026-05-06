"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Member, MemberPlan, MemberStatus } from "@/types";
import { deleteMember, freezeMember, activateMember } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import AddMemberModal from "./AddMemberModal";

// ── helpers ──────────────────────────────────────────────────────────────────

const PLAN_LABEL: Record<MemberPlan, string> = {
    BASIC: "Basic (1 mo)",
    PRO: "Pro (3 mo)",
    ELITE: "Elite (12 mo)",
};

const STATUS_COLORS: Record<string, string> = {
    ACTIVE: "bg-emerald-100 text-emerald-700",
    EXPIRED: "bg-red-100 text-red-600",
    FROZEN: "bg-sky-100 text-sky-700",
    "Expiring Soon": "bg-amber-100 text-amber-700",
};

const statusLabel = (status: Member["status"]) =>
    status === "ACTIVE"
        ? "Active"
        : status === "EXPIRED"
            ? "Expired"
            : status === "FROZEN"
                ? "Frozen"
                : "Expiring Soon";

const fmtDate = (iso: string) => {
    if (!iso) return "—";
    try {
        return new Date(iso).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    } catch {
        return iso;
    }
};

// ── component ─────────────────────────────────────────────────────────────────

type Props = { initialMembers: Member[] };

export default function MembersClient({ initialMembers }: Props) {
    const [members, setMembers] = useState<Member[]>(initialMembers);
    const [search, setSearch] = useState("");
    const [planFilter, setPlanFilter] = useState<"All" | MemberPlan>("All");
    const [statusFilter, setStatusFilter] = useState<"All" | MemberStatus | "Expiring Soon">("All");
    const [showAddModal, setShowAddModal] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return members.filter((m) => {
            const name = (m.fullName || "").toLowerCase();
            const email = (m.email || "").toLowerCase();
            const phone = (m.phone || "");
            const matchSearch =
                !q || name.includes(q) || email.includes(q) || phone.includes(q);
            const matchPlan = planFilter === "All" || m.plan === planFilter;
            const matchStatus = statusFilter === "All" || m.status === statusFilter;
            return matchSearch && matchPlan && matchStatus;
        });
    }, [members, search, planFilter, statusFilter]);

    const showToast = (msg: string, ok = true) => {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), 3000);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setActionLoading(deleteId);
        const token = getAuthToken() || undefined;
        const res = await deleteMember(deleteId, token);
        if (res.success) {
            setMembers((prev) => prev.filter((m) => m.id !== deleteId));
            showToast("Member removed.");
        } else {
            showToast("Failed to delete. Try again.", false);
        }
        setDeleteId(null);
        setActionLoading(null);
    };

    const handleFreeze = async (id: string) => {
        setActionLoading(id);
        const token = getAuthToken() || undefined;
        const res = await freezeMember(id, token);
        if (res.success && res.data) {
            setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, status: "FROZEN" } : m)));
            showToast("Member frozen.");
        } else {
            showToast("Action failed.", false);
        }
        setActionLoading(null);
    };

    const handleActivate = async (id: string) => {
        setActionLoading(id);
        const token = getAuthToken() || undefined;
        const res = await activateMember(id, token);
        if (res.success && res.data) {
            setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, status: "ACTIVE" } : m)));
            showToast("Member activated.");
        } else {
            showToast("Action failed.", false);
        }
        setActionLoading(null);
    };

    const handleMemberAdded = (m: Member) => {
        const fullName =
            m.fullName || [m.firstName, m.lastName].filter(Boolean).join(" ").trim() || "New Member";
        const expiryDate = m.expiryDate ?? "";
        const daysLeft =
            typeof m.daysLeft === "number" && !isNaN(m.daysLeft)
                ? m.daysLeft
                : expiryDate
                    ? Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86400000)
                    : 0;
        const normalised: Member = {
            ...m,
            fullName,
            email: m.email ?? "",
            phone: m.phone ?? "",
            plan: m.plan ?? "BASIC",
            status: m.status ?? "ACTIVE",
            daysLeft,
            joinDate: m.joinDate ?? new Date().toISOString(),
            expiryDate,
            createdAt: m.createdAt ?? new Date().toISOString(),
        };
        setMembers((prev) => [normalised, ...prev]);
        setShowAddModal(false);
        showToast("Member added successfully!");
    };

    return (
        <>
            {/* Toast */}
            {toast && (
                <div
                    className={`fixed right-6 top-6 z-50 rounded-xl px-5 py-3 text-sm font-medium shadow-lg transition-all ${toast.ok
                        ? "bg-emerald-600 text-white"
                        : "bg-red-600 text-white"
                        }`}
                >
                    {toast.msg}
                </div>
            )}

            {/* Header row */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Members</h1>
                    <p className="text-sm text-gray-500">{filtered.length} member{filtered.length !== 1 ? "s" : ""} shown</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-700 active:scale-95 transition-all"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Add New Member
                </button>
            </div>

            {/* Filters */}
            <div className="mb-5 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by name, email, or phone…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 py-2.5 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                </div>

                <select
                    value={planFilter}
                    onChange={(e) => setPlanFilter(e.target.value as typeof planFilter)}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                >
                    <option value="All">All Plans</option>
                    <option value="BASIC">Basic (1 month)</option>
                    <option value="PRO">Pro (3 months)</option>
                    <option value="ELITE">Elite (12 months)</option>
                </select>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                >
                    <option value="All">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="Expiring Soon">Expiring Soon</option>
                    <option value="EXPIRED">Expired</option>
                    <option value="FROZEN">Frozen</option>
                </select>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                <th className="px-5 py-3.5 text-left">Member</th>
                                <th className="px-5 py-3.5 text-left">Phone</th>
                                <th className="px-5 py-3.5 text-left">Plan</th>
                                <th className="px-5 py-3.5 text-left">Joined</th>
                                <th className="px-5 py-3.5 text-left">Expires</th>
                                <th className="px-5 py-3.5 text-left">Days Left</th>
                                <th className="px-5 py-3.5 text-left">Status</th>
                                <th className="px-5 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-16 text-center text-gray-400">
                                        No members found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((member) => {
                                    const isBusy = actionLoading === member.id;
                                    const isExpiringSoon =
                                        member.status === "ACTIVE" && member.daysLeft <= 7 && member.daysLeft >= 0;
                                    const displayStatus = isExpiringSoon ? "Expiring Soon" : member.status;

                                    return (
                                        <tr key={member.id} className="hover:bg-gray-50/70 transition-colors">
                                            {/* Member Name + Email */}
                                            <td className="px-5 py-4">
                                                <div className="font-semibold text-gray-900">{member.fullName || "—"}</div>
                                                <div className="text-xs text-gray-400">{member.email}</div>
                                            </td>
                                            <td className="px-5 py-4 text-gray-600">{member.phone}</td>

                                            {/* Plan */}
                                            <td className="px-5 py-4">
                                                <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                                                    {PLAN_LABEL[member.plan as MemberPlan] ?? member.plan}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-gray-500">{fmtDate(member.joinDate)}</td>
                                            <td className="px-5 py-4 text-gray-500">{fmtDate(member.expiryDate)}</td>

                                            {/* Days Left */}
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`font-semibold ${member.daysLeft < 0
                                                        ? "text-red-500"
                                                        : member.daysLeft <= 7
                                                            ? "text-amber-600"
                                                            : "text-gray-700"
                                                        }`}
                                                >
                                                    {member.daysLeft < 0 ? "Expired" : `${member.daysLeft}d`}
                                                </span>
                                            </td>

                                            {/* Status badge */}
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[displayStatus] ?? "bg-gray-100 text-gray-600"
                                                        }`}
                                                >
                                                    {statusLabel(displayStatus as Member["status"])}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Link
                                                        href={`/members/${member.id}`}
                                                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                                                    >
                                                        View
                                                    </Link>
                                                    <Link
                                                        href={`/members/${member.id}?mode=edit`}
                                                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                    >
                                                        Edit
                                                    </Link>
                                                    {member.status === "FROZEN" ? (
                                                        <button
                                                            onClick={() => handleActivate(member.id)}
                                                            disabled={isBusy}
                                                            className="rounded-lg px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-40"
                                                        >
                                                            {isBusy ? "…" : "Activate"}
                                                        </button>
                                                    ) : member.status === "ACTIVE" ? (
                                                        <button
                                                            onClick={() => handleFreeze(member.id)}
                                                            disabled={isBusy}
                                                            className="rounded-lg px-3 py-1.5 text-xs font-medium text-sky-600 hover:bg-sky-50 transition-colors disabled:opacity-40"
                                                        >
                                                            {isBusy ? "…" : "Freeze"}
                                                        </button>
                                                    ) : null}
                                                    <button
                                                        onClick={() => setDeleteId(member.id)}
                                                        disabled={isBusy}
                                                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete confirm dialog */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                        <h3 className="mb-2 text-lg font-bold text-gray-900">Delete Member?</h3>
                        <p className="mb-6 text-sm text-gray-500">
                            This will permanently remove the member. This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={!!actionLoading}
                                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                            >
                                {actionLoading ? "Deleting…" : "Yes, Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Member Modal */}
            {showAddModal && (
                <AddMemberModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={handleMemberAdded}
                />
            )}
        </>
    );
}

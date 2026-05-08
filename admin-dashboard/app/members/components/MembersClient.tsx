"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Member, MemberPlan, MemberStatus } from "@/types";
import { useTransition } from "react";
import { deleteMember, freezeMember, activateMember, getMembers } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import AddMemberModal from "./AddMemberModal";


// ── helpers ──────────────────────────────────────────────────────────────────

const PLAN_LABEL: Record<MemberPlan, string> = {
    BASIC: "Basic (1 mo)",
    PRO: "Pro (3 mo)",
    ELITE: "Elite (12 mo)",
};

const STATUS_COLORS: Record<string, string> = {
    ACTIVE: "bg-emerald-100 text-emerald-800",
    EXPIRED: "bg-rose-100 text-rose-700",
    FROZEN: "bg-slate-100 text-slate-700",
    "Expiring Soon": "bg-amber-100 text-amber-800",
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

type Props = {
    initialMembers: Member[];
    initialTotal: number;
    initialPage: number;
    initialLimit: number;
};

export default function MembersClient({
    initialMembers,
    initialTotal,
    initialPage,
    initialLimit,
}: Props) {
    const router = useRouter();
    const [members, setMembers] = useState<Member[]>(initialMembers);
    const [total, setTotal] = useState(initialTotal);
    const [page, setPage] = useState(initialPage);
    const [limit, setLimit] = useState(initialLimit);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [planFilter, setPlanFilter] = useState<"All" | MemberPlan>("All");
    const [statusFilter, setStatusFilter] = useState<"All" | MemberStatus | "Expiring Soon">("All");
    const [showAddModal, setShowAddModal] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
    const [isPending, startTransition] = useTransition();

    // Sync with server if the props update (e.g. after a router.refresh)
    useMemo(() => {
        setMembers(initialMembers);
        setTotal(initialTotal);
    }, [initialMembers, initialTotal]);

    const isInitialLoad = useRef(true);

    useEffect(() => {
        const token = getAuthToken() || undefined;
        const timer = setTimeout(async () => {
            if (isInitialLoad.current) {
                isInitialLoad.current = false;
                return;
            }

            setLoading(true);
            const params: Record<string, string> = {
                page: String(page),
                limit: String(limit),
            };

            if (search) params.search = search;
            if (planFilter !== "All") params.plan = planFilter;
            if (statusFilter === "Expiring Soon") {
                params.expiringSoon = "true";
            } else if (statusFilter !== "All") {
                params.status = statusFilter;
            }

            const response = await getMembers(token, params);
            if (response.success && response.data) {
                const mapped = response.data.data.map((m) => {
                    if (typeof m.daysLeft !== "number") {
                        throw new Error(`Critical data missing: daysLeft for member ${m.id}`);
                    }
                    const fullName =
                        m.fullName || [m.firstName, m.lastName].filter(Boolean).join(" ").trim();
                    return { ...m, fullName, daysLeft: m.daysLeft };
                });
                setMembers(mapped);
                setTotal(response.data.total);
            }
            setLoading(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [search, planFilter, statusFilter, page, limit]);

    const stats = useMemo(() => {
        const expiringSoon = members.filter((member) =>
            member.status === "ACTIVE" && member.daysLeft <= 7 && member.daysLeft >= 0
        ).length;
        const expired = members.filter((member) => member.status === "EXPIRED").length;
        const active = members.filter((member) => member.status === "ACTIVE").length;
        const frozen = members.filter((member) => member.status === "FROZEN").length;

        return {
            total,
            active,
            frozen,
            expired,
            expiringSoon,
        };
    }, [members, total]);

    const showToast = (msg: string, ok = true) => {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), 3000);
    };

    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);

    const handleDelete = async () => {
        if (!deleteId) return;
        setActionLoading(deleteId);
        const token = getAuthToken() || undefined;
        const res = await deleteMember(deleteId, token);
        if (res.success) {
            setMembers((prev) => prev.filter((m) => m.id !== deleteId));
            showToast("Member removed.");
            startTransition(() => {
                router.refresh();
                setDeleteId(null);
                setActionLoading(null);
            });
        } else {
            showToast(res.message || "Failed to delete. Try again.", false);
            setDeleteId(null);
            setActionLoading(null);
        }
    };

    const handleFreeze = async (id: string) => {
        setActionLoading(id);
        const token = getAuthToken() || undefined;
        const res = await freezeMember(id, token);
        if (res.success) {
            setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, status: "FROZEN" } : m)));
            showToast("Member frozen.");
            startTransition(() => {
                router.refresh();
                setActionLoading(null);
            });
        } else {
            showToast(res.message || "Action failed.", false);
            setActionLoading(null);
        }
    };

    const handleActivate = async (id: string) => {
        setActionLoading(id);
        const token = getAuthToken() || undefined;
        const res = await activateMember(id, token);
        if (res.success) {
            setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, status: "ACTIVE" } : m)));
            showToast("Member activated.");
            startTransition(() => {
                router.refresh();
                setActionLoading(null);
            });
        } else {
            showToast(res.message || "Action failed.", false);
            setActionLoading(null);
        }
    };

    const handleMemberAdded = (m: any) => {
        // m could be { user, member, payment } from onboarding API
        const newMember = m?.member ? m.member : m;

        const normalised: Member = {
            ...newMember,
            fullName: newMember.fullName || [newMember.firstName, newMember.lastName].filter(Boolean).join(" ").trim() || "New Member",
        };
        setMembers(prev => [normalised, ...prev]);
        setShowAddModal(false);
        showToast("Member added successfully!");

        startTransition(() => {
            router.refresh();
            // Wait momentarily to show toast before redirecting
            setTimeout(() => {
                if (newMember?.id) {
                    router.push(`/members/${newMember.id}`);
                }
            }, 800);
        });
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
            <div className="mb-6 rounded-2xl border border-black/10 bg-[linear-gradient(120deg,#fff7ed,rgba(255,255,255,0.9))] px-6 py-6 shadow-soft">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="font-['Space_Grotesk'] text-3xl font-semibold text-black">Members</h1>
                        <p className="text-sm text-black/60">
                            Showing {members.length} of {total} members
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-neutral-800 active:scale-[0.98] transition-all"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Add New Member
                    </button>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="rounded-xl border border-black/10 bg-white px-4 py-3">
                        <div className="text-xs uppercase text-black/50">Total</div>
                        <div className="mt-2 text-2xl font-semibold text-black">{stats.total}</div>
                    </div>
                    <div className="rounded-xl border border-black/10 bg-white px-4 py-3">
                        <div className="text-xs uppercase text-black/50">Active</div>
                        <div className="mt-2 text-2xl font-semibold text-black">{stats.active}</div>
                    </div>
                    <div className="rounded-xl border border-black/10 bg-white px-4 py-3">
                        <div className="text-xs uppercase text-black/50">Expiring Soon</div>
                        <div className="mt-2 text-2xl font-semibold text-black">{stats.expiringSoon}</div>
                    </div>
                    <div className="rounded-xl border border-black/10 bg-white px-4 py-3">
                        <div className="text-xs uppercase text-black/50">Expired</div>
                        <div className="mt-2 text-2xl font-semibold text-black">{stats.expired}</div>
                    </div>
                    <div className="rounded-xl border border-black/10 bg-white px-4 py-3">
                        <div className="text-xs uppercase text-black/50">Frozen</div>
                        <div className="mt-2 text-2xl font-semibold text-black">{stats.frozen}</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-5 rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative w-full sm:flex-1 sm:min-w-[220px]">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by name, email, or phone"
                            value={search}
                            onChange={(e) => {
                                setPage(1);
                                setSearch(e.target.value);
                            }}
                            className="w-full rounded-xl border border-black/10 bg-white pl-9 pr-4 py-2.5 text-sm shadow-sm focus:border-black focus:outline-none"
                        />
                    </div>

                    <div className="flex w-full gap-3 sm:w-auto">
                        <select
                            value={planFilter}
                            onChange={(e) => {
                                setPage(1);
                                setPlanFilter(e.target.value as typeof planFilter);
                            }}
                            className="w-full sm:w-auto flex-1 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-black focus:outline-none"
                        >
                            <option value="All">All Plans</option>
                            <option value="BASIC">Basic (1 month)</option>
                            <option value="PRO">Pro (3 months)</option>
                            <option value="ELITE">Elite (12 months)</option>
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setPage(1);
                                setStatusFilter(e.target.value as typeof statusFilter);
                            }}
                            className="w-full sm:w-auto flex-1 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-black focus:outline-none"
                        >
                            <option value="All">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="Expiring Soon">Expiring Soon</option>
                            <option value="EXPIRED">Expired</option>
                            <option value="FROZEN">Frozen</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b border-black/10 bg-black/[0.02] text-xs font-semibold uppercase tracking-wide text-black/60">
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
                        <tbody className="divide-y divide-black/5">
                            {members.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-16 text-center text-black/40">
                                        {loading ? "Loading members..." : "No members found matching your filters."}
                                    </td>
                                </tr>
                            ) : (
                                members.map((member) => {
                                    // if isPending is true, consider the action still loading
                                    const isBusy = actionLoading === member.id || isPending;
                                    const isExpiringSoon =
                                        member.status === "ACTIVE" && member.daysLeft <= 7 && member.daysLeft >= 0;
                                    const displayStatus = isExpiringSoon ? "Expiring Soon" : member.status;

                                    return (
                                        <tr key={member.id} className="hover:bg-black/[0.02] transition-colors">
                                            {/* Member Name + Email */}
                                            <td className="px-5 py-4">
                                                <div className="font-semibold text-black">{member.fullName || "—"}</div>
                                                <div className="text-xs text-black/40">{member.email}</div>
                                            </td>
                                            <td className="px-5 py-4 text-black/70">{member.phone}</td>

                                            {/* Plan */}
                                            <td className="px-5 py-4">
                                                <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                                    {PLAN_LABEL[member.plan as MemberPlan] ?? member.plan}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-black/60">{fmtDate(member.joinDate)}</td>
                                            <td className="px-5 py-4 text-black/60">{fmtDate(member.expiryDate)}</td>

                                            {/* Days Left */}
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`font-semibold ${member.daysLeft < 0
                                                        ? "text-rose-600"
                                                        : member.daysLeft <= 7
                                                            ? "text-amber-600"
                                                            : "text-black/70"
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
                                                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-black/60 hover:bg-black/5 transition-colors"
                                                    >
                                                        View
                                                    </Link>
                                                    <Link
                                                        href={`/members/${member.id}?mode=edit`}
                                                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 transition-colors"
                                                    >
                                                        Edit
                                                    </Link>
                                                    {member.status === "FROZEN" ? (
                                                        <button
                                                            onClick={() => handleActivate(member.id)}
                                                            disabled={isBusy}
                                                            className="rounded-lg px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 transition-colors disabled:opacity-40"
                                                        >
                                                            {isBusy ? "…" : "Activate"}
                                                        </button>
                                                    ) : member.status === "ACTIVE" ? (
                                                        <button
                                                            onClick={() => handleFreeze(member.id)}
                                                            disabled={isBusy}
                                                            className="rounded-lg px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50 transition-colors disabled:opacity-40"
                                                        >
                                                            {isBusy ? "…" : "Freeze"}
                                                        </button>
                                                    ) : null}
                                                    <button
                                                        onClick={() => setDeleteId(member.id)}
                                                        disabled={isBusy}
                                                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40"
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

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-black/60">
                    Page {safePage} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={limit}
                        onChange={(e) => {
                            setPage(1);
                            setLimit(Number(e.target.value));
                        }}
                        className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none"
                    >
                        <option value={10}>10 / page</option>
                        <option value={20}>20 / page</option>
                        <option value={50}>50 / page</option>
                    </select>
                    <button
                        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                        disabled={safePage <= 1 || loading}
                        className="rounded-xl border border-black/10 px-3 py-2 text-sm text-black/70 hover:bg-black/5 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={safePage >= totalPages || loading}
                        className="rounded-xl border border-black/10 px-3 py-2 text-sm text-black/70 hover:bg-black/5 disabled:opacity-50"
                    >
                        Next
                    </button>
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

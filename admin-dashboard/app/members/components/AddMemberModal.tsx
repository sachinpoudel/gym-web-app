"use client";

import { useState } from "react";
import type { CreateMemberPayload, Member, MemberPlan, PaymentMethod } from "@/types";
import { createMember } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";

type Props = {
    onClose: () => void;
    onSuccess: (member: Member) => void;
};

const PLAN_OPTIONS: { value: MemberPlan; label: string; months: number; price: number }[] = [
    { value: "BASIC", label: "Basic", months: 1, price: 1500 },
    { value: "PRO", label: "Pro", months: 3, price: 3500 },
    { value: "ELITE", label: "Elite", months: 12, price: 10000 },
];

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
    { value: "CASH", label: "Cash" },
    { value: "CARD", label: "Card" },
    { value: "ONLINE", label: "Online Transfer" },
];

const todayISO = () => new Date().toISOString().slice(0, 10);

const addMonths = (dateStr: string, months: number) => {
    const d = new Date(dateStr);
    d.setMonth(d.getMonth() + months);
    return d.toISOString().slice(0, 10);
};

export default function AddMemberModal({ onClose, onSuccess }: Props) {
    const [step, setStep] = useState<1 | 2>(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        healthNotes: "",
        plan: "BASIC" as MemberPlan,
        joinDate: todayISO(),
        expiryDate: addMonths(todayISO(), 1),
        paymentAmount: 1500,
        paymentMethod: "CASH" as PaymentMethod,
    });

    const set = (key: string, value: string | number) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const handlePlanChange = (plan: MemberPlan) => {
        const option = PLAN_OPTIONS.find((p) => p.value === plan)!;
        setForm((prev) => ({
            ...prev,
            plan,
            expiryDate: addMonths(prev.joinDate, option.months),
            paymentAmount: option.price,
        }));
    };

    const handleJoinDateChange = (date: string) => {
        const option = PLAN_OPTIONS.find((p) => p.value === form.plan)!;
        setForm((prev) => ({
            ...prev,
            joinDate: date,
            expiryDate: addMonths(date, option.months),
        }));
    };

    // Step 1 validation
    const step1Valid =
        form.firstName.trim() !== "" &&
        form.lastName.trim() !== "" &&
        form.email.trim() !== "" &&
        form.phone.trim() !== "" &&
        form.dateOfBirth !== "";

    const handleGoToStep2 = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!step1Valid) return;
        setError(null);
        setStep(2);
    };

    const handleSubmit = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setLoading(true);
        setError(null);

        const payload: CreateMemberPayload = {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            email: form.email.trim().toLowerCase(),
            phone: form.phone.trim(),
            dateOfBirth: form.dateOfBirth,
            plan: form.plan,
            joinDate: form.joinDate,
            expiryDate: form.expiryDate,
            paymentAmount: Number(form.paymentAmount),
            paymentMethod: form.paymentMethod,
            ...(form.emergencyContactName.trim()
                ? { emergencyContactName: form.emergencyContactName.trim() }
                : {}),
            ...(form.emergencyContactPhone.trim()
                ? { emergencyContactPhone: form.emergencyContactPhone.trim() }
                : {}),
            ...(form.healthNotes.trim() ? { healthNotes: form.healthNotes.trim() } : {}),
        };

        const token = getAuthToken() || undefined;
        const res = await createMember(payload, token);

        if (!res.success || !res.data) {
            setError(res.message || "Failed to create member. Please try again.");
            setLoading(false);
            return;
        }

        onSuccess(res.data);
        // onClose is called inside handleMemberAdded in parent
    };

    const inputCls =
        "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 bg-white transition";
    const labelCls = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            {/* prevent clicks inside from closing */}
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">

                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Add New Member</h2>
                        {/* Step indicator */}
                        <div className="mt-1 flex items-center gap-2">
                            <div className={`h-2 w-16 rounded-full ${step >= 1 ? "bg-indigo-500" : "bg-gray-200"}`} />
                            <div className={`h-2 w-16 rounded-full ${step >= 2 ? "bg-indigo-500" : "bg-gray-200"}`} />
                            <span className="text-xs text-gray-400">Step {step} of 2</span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-2 hover:bg-gray-100 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* ─── STEP 1: Personal Info ─────────────────────────────── */}
                {step === 1 && (
                    <div className="px-6 py-5 space-y-5">
                        <p className="text-sm font-semibold text-gray-700">Personal Information</p>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className={labelCls}>First Name *</label>
                                <input
                                    className={inputCls}
                                    value={form.firstName}
                                    onChange={(e) => set("firstName", e.target.value)}
                                    placeholder="Sachin"
                                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); } }}
                                />
                            </div>
                            <div>
                                <label className={labelCls}>Last Name *</label>
                                <input
                                    className={inputCls}
                                    value={form.lastName}
                                    onChange={(e) => set("lastName", e.target.value)}
                                    placeholder="Poudel"
                                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); } }}
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className={labelCls}>Email *</label>
                                <input
                                    type="email"
                                    className={inputCls}
                                    value={form.email}
                                    onChange={(e) => set("email", e.target.value)}
                                    placeholder="sachin@email.com"
                                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); } }}
                                />
                            </div>
                            <div>
                                <label className={labelCls}>Phone *</label>
                                <input
                                    type="tel"
                                    className={inputCls}
                                    value={form.phone}
                                    onChange={(e) => set("phone", e.target.value)}
                                    placeholder="+977 9800000000"
                                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); } }}
                                />
                            </div>
                        </div>

                        <div>
                            <label className={labelCls}>Date of Birth *</label>
                            <input
                                type="date"
                                className={inputCls}
                                value={form.dateOfBirth}
                                onChange={(e) => set("dateOfBirth", e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); } }}
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className={labelCls}>Emergency Contact Name</label>
                                <input
                                    className={inputCls}
                                    value={form.emergencyContactName}
                                    onChange={(e) => set("emergencyContactName", e.target.value)}
                                    placeholder="Contact person name"
                                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); } }}
                                />
                            </div>
                            <div>
                                <label className={labelCls}>Emergency Contact Phone</label>
                                <input
                                    type="tel"
                                    className={inputCls}
                                    value={form.emergencyContactPhone}
                                    onChange={(e) => set("emergencyContactPhone", e.target.value)}
                                    placeholder="+977 98XXXXXXXX"
                                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); } }}
                                />
                            </div>
                        </div>

                        <div>
                            <label className={labelCls}>Health Notes / Medical Conditions</label>
                            <textarea
                                className={inputCls}
                                rows={3}
                                value={form.healthNotes}
                                onChange={(e) => set("healthNotes", e.target.value)}
                                placeholder="Any allergies, injuries, or conditions..."
                            />
                        </div>

                        {/* Step 1 footer */}
                        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleGoToStep2}
                                disabled={!step1Valid}
                                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                            >
                                Next: Membership →
                            </button>
                        </div>
                    </div>
                )}

                {/* ─── STEP 2: Membership & Payment ─────────────────────── */}
                {step === 2 && (
                    <div className="px-6 py-5 space-y-5">
                        <p className="text-sm font-semibold text-gray-700">Membership & Payment</p>

                        {/* Plan cards */}
                        <div>
                            <label className={labelCls}>Membership Plan *</label>
                            <div className="grid gap-3 sm:grid-cols-3">
                                {PLAN_OPTIONS.map((p) => (
                                    <button
                                        key={p.value}
                                        type="button"
                                        onClick={() => handlePlanChange(p.value)}
                                        className={`rounded-xl border-2 p-4 text-left transition-all ${form.plan === p.value
                                            ? "border-indigo-500 bg-indigo-50 shadow-sm"
                                            : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                                            }`}
                                    >
                                        <div className="font-bold text-sm text-gray-900">{p.label}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">
                                            {p.months} month{p.months > 1 ? "s" : ""}
                                        </div>
                                        <div className="mt-2 text-lg font-extrabold text-indigo-600">
                                            Rs. {p.price.toLocaleString()}
                                        </div>
                                        {form.plan === p.value && (
                                            <div className="mt-1 text-xs text-indigo-500 font-medium">✓ Selected</div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className={labelCls}>Join Date *</label>
                                <input
                                    type="date"
                                    className={inputCls}
                                    value={form.joinDate}
                                    onChange={(e) => handleJoinDateChange(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className={labelCls}>Expiry Date (auto-calculated)</label>
                                <input
                                    type="date"
                                    className={inputCls}
                                    value={form.expiryDate}
                                    onChange={(e) => set("expiryDate", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className={labelCls}>Amount Paid (Rs.) *</label>
                                <input
                                    type="number"
                                    min={0}
                                    className={inputCls}
                                    value={form.paymentAmount}
                                    onChange={(e) => set("paymentAmount", Number(e.target.value))}
                                />
                            </div>
                            <div>
                                <label className={labelCls}>Payment Method *</label>
                                <select
                                    className={inputCls}
                                    value={form.paymentMethod}
                                    onChange={(e) => set("paymentMethod", e.target.value as PaymentMethod)}
                                >
                                    {PAYMENT_METHODS.map((pm) => (
                                        <option key={pm.value} value={pm.value}>{pm.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm">
                            <div className="font-semibold text-gray-700 mb-2">Summary</div>
                            <div className="space-y-1 text-gray-500">
                                <div className="flex justify-between">
                                    <span>Member</span>
                                    <span className="font-medium text-gray-800">{form.firstName} {form.lastName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Plan</span>
                                    <span className="font-medium text-gray-800">{PLAN_OPTIONS.find(p => p.value === form.plan)?.label}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Valid until</span>
                                    <span className="font-medium text-gray-800">{form.expiryDate}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Payment</span>
                                    <span className="font-medium text-gray-800">Rs. {Number(form.paymentAmount).toLocaleString()} ({form.paymentMethod})</span>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        {/* Step 2 footer */}
                        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                            <button
                                type="button"
                                onClick={() => { setStep(1); setError(null); }}
                                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                ← Back
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                                className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        Creating…
                                    </>
                                ) : (
                                    "✓ Create Member"
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

"use client";

import { getAdminName } from "@/lib/auth";
import { useEffect, useState } from "react";

type TopbarProps = {
  title: string;
  onMenuClick?: () => void;
};

export default function Topbar({ title, onMenuClick }: TopbarProps) {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    setName(getAdminName());
  }, []);

  const initials = name
    ? name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
    : "AD";

  return (
    <header className="flex items-center justify-between border-b border-black/10 bg-white px-4 sm:px-8 py-4 shrink-0">
      <div className="flex items-center gap-3 sm:gap-4 flex-1">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="rounded-lg p-1.5 -ml-1 text-black hover:bg-gray-100 active:bg-gray-200 transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <h1 className="text-lg sm:text-xl font-semibold text-black truncate">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-sm font-medium text-black">{name || "Admin"}</div>
          <div className="text-xs text-black/50">Admin Account</div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-black text-sm font-semibold">
          {initials}
        </div>
      </div>
    </header>
  );
}

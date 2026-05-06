"use client";

import { getAdminName } from "@/lib/auth";
import { useEffect, useState } from "react";

type TopbarProps = {
  title: string;
};

export default function Topbar({ title }: TopbarProps) {
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
    <header className="flex items-center justify-between border-b border-black/10 bg-white px-8 py-5">
      <h1 className="text-xl font-semibold text-black">{title}</h1>
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

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import Button from "@/components/ui/Button";
import { clearAuthSession, getAdminName } from "@/lib/auth";
import { useEffect, useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Members", href: "/members" },
];

const disabledItems = [
  { label: "Trainers", href: "/trainers" },
  { label: "Bookings", href: "/bookings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [adminName, setAdminName] = useState<string | null>(null);

  useEffect(() => {
    setAdminName(getAdminName());
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    router.replace("/login");
  };

  return (
    <aside className="flex h-screen w-64 flex-col bg-ink text-white">
      <div className="px-6 py-6">
        <div className="text-lg font-semibold">Gym Admin</div>
        <div className="text-xs text-white/60">Control Center</div>
      </div>
      <nav className="flex-1 space-y-2 px-4">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                active
                  ? "bg-white text-black"
                  : "text-white/80 hover:bg-white/10"
              )}
            >
              {item.label}
            </Link>
          );
        })}
        <div className="pt-6 text-xs uppercase text-white/40">Coming soon</div>
        {disabledItems.map((item) => (
          <div
            key={item.href}
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-white/30"
          >
            {item.label}
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 px-4 py-4">
        <div className="text-sm font-medium">
          {adminName || "Admin"}
        </div>
        <div className="mb-3 text-xs text-white/60">Administrator</div>
        <Button
          variant="outline"
          className="w-full border-white text-white hover:bg-white/10"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
    </aside>
  );
}

"use client";

import type { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

type DashboardLayoutProps = {
  title: string;
  children: ReactNode;
};

export default function DashboardLayout({ title, children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50 text-black">
      {/* Sidebar: fixed height, no scroll */}
      <Sidebar />
      {/* Main area: scrolls independently */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto px-8 py-6">{children}</main>
      </div>
    </div>
  );
}

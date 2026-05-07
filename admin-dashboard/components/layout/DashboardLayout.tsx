"use client";

import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import clsx from "clsx";

type DashboardLayoutProps = {
  title: string;
  children: ReactNode;
};

export default function DashboardLayout({ title, children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768; // Tailwind md breakpoint
      setIsMobile(mobile);
    };
    handleResize(); // set initially on client
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sync initial sidebar state with window size on mount only
  useEffect(() => {
    setSidebarOpen(window.innerWidth >= 768);
  }, []);

  // When toggle is clicked
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50 text-black">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Wrapper */}
      <div
        className={clsx(
          "fixed inset-y-0 left-0 z-50 flex transform transition-all duration-300 outline-none md:relative",
          sidebarOpen ? "translate-x-0 md:ml-0" : "-translate-x-full md:-ml-64"
        )}
      >
        <Sidebar onNavigate={() => isMobile && setSidebarOpen(false)} />
      </div>

      {/* Main area: scrolls independently */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Topbar title={title} onMenuClick={toggleSidebar} />
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}

"use client";

import { AuthGuard } from "@/features/auth/auth-guard";
import { Sidebar, MobileSidebar } from "@/components/dashboard/sidebar";
import { Navbar } from "@/components/dashboard/navbar";
import type { ReactNode } from "react";

interface DashboardShellProps {
  children: ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Desktop sidebar */}
        <Sidebar />

        {/* Mobile sidebar drawer */}
        <MobileSidebar />

        {/* Main content area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Navbar />
          <main className="flex flex-1 flex-col overflow-hidden p-0">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}

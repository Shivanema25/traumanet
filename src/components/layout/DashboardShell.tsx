"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface DashboardShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function DashboardShell({ children, title, subtitle }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* Main content body */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          title={title}
          subtitle={subtitle}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}

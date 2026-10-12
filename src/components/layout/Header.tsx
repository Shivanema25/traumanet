"use client";

import React from "react";
import Link from "next/link";
import { Menu, RefreshCw, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface HeaderProps {
  onMenuToggle?: () => void;
  title?: string;
  subtitle?: string;
}

export function Header({
  onMenuToggle,
  title = "Logistics Operations Center",
  subtitle = "Nagpur Metropolitan Sector (Wardha Corridor / MIHAN Hub)",
}: HeaderProps) {
  const [isResetting, setIsResetting] = React.useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await fetch("/api/demo/reset", { method: "POST" });
      window.location.reload();
    } catch (e) {
      console.error(e);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <header className="h-16 px-4 sm:px-6 bg-white border-b border-slate-300 shadow-xs sticky top-0 z-30 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              {title}
            </h1>
            <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
              Golden Hour Active
            </span>
          </div>
          <p className="text-[11px] text-slate-500 hidden sm:block truncate mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link href="/paramedic" className="hidden sm:block">
          <Button variant="outline" size="sm" leftIcon={<Smartphone className="w-3.5 h-3.5 text-blue-600" />}>
            Paramedic App
          </Button>
        </Link>

        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          isLoading={isResetting}
          leftIcon={<RefreshCw className="w-3.5 h-3.5 text-emerald-600" />}
          title="Reset demo data"
        >
          Reset Demo
        </Button>
      </div>
    </header>
  );
}

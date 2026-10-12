"use client";

import React from "react";
import Link from "next/link";
import { Menu, RefreshCw, Smartphone, ShieldAlert } from "lucide-react";
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
    <header className="h-16 px-4 sm:px-6 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-30 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-sm sm:text-base font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <span>{title}</span>
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950/70 text-red-400 border border-red-800/60 font-normal">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              GOLDEN HOUR PROTOCOL ACTIVE
            </span>
          </h1>
          <p className="text-[11px] text-slate-400 font-mono hidden sm:block truncate">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link href="/paramedic" className="hidden sm:block">
          <Button variant="outline" size="sm" leftIcon={<Smartphone className="w-3.5 h-3.5 text-blue-400" />}>
            Paramedic App
          </Button>
        </Link>

        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          isLoading={isResetting}
          leftIcon={<RefreshCw className="w-3.5 h-3.5 text-emerald-400" />}
          title="Reset all demo states back to Nagpur seed baseline"
        >
          Reset Demo
        </Button>
      </div>
    </header>
  );
}

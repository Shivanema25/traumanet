"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Activity,
  Ambulance,
  Building2,
  FileCheck2,
  LayoutDashboard,
  MapPin,
  ShieldAlert,
  SlidersHorizontal,
  Users,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: "emergency" | "success" | "electric";
}

const navItems: NavItem[] = [
  {
    label: "Mission Control",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Paramedic Node #108",
    href: "/paramedic",
    icon: Ambulance,
    badge: "MOBILE",
    badgeVariant: "electric",
  },
  {
    label: "Hospital ER Command",
    href: "/hospital-er",
    icon: Building2,
    badge: "LIVE ER",
    badgeVariant: "emergency",
  },
  {
    label: "Active Emergencies",
    href: "/emergency",
    icon: ShieldAlert,
  },
  {
    label: "Trauma Hospitals",
    href: "/hospitals",
    icon: Activity,
  },
  {
    label: "Family & Cashless",
    href: "/family-portal",
    icon: Users,
  },
  {
    label: "CGHS Bill Audits",
    href: "/audits",
    icon: FileCheck2,
  },
  {
    label: "Nagpur Live Map",
    href: "/map",
    icon: MapPin,
  },
  {
    label: "Scenario Controller",
    href: "/admin-demo",
    icon: SlidersHorizontal,
    badge: "DEMO",
    badgeVariant: "success",
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-slate-950/90 backdrop-blur-xl border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/25 border border-red-400/40 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
                Trauma<span className="text-red-500">Net</span>
              </span>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
                Logistics Command
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || (item.href === "/dashboard" && pathname === "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group",
                  isActive
                    ? "bg-slate-800/90 text-white font-semibold shadow-inner border border-slate-700/80"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive
                        ? "text-red-400"
                        : "text-slate-400 group-hover:text-slate-200"
                    )}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={cn(
                      "text-[9px] font-mono px-1.5 py-0.5 rounded uppercase tracking-wider font-bold",
                      item.badgeVariant === "emergency" &&
                        "bg-red-950/80 text-red-400 border border-red-800/60",
                      item.badgeVariant === "electric" &&
                        "bg-blue-950/80 text-blue-400 border border-blue-800/60",
                      item.badgeVariant === "success" &&
                        "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Network System Footer Status */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/50">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-mono font-medium text-slate-200 truncate">
              Nagpur Mesh Online
            </p>
            <p className="text-[9px] text-slate-400 font-mono truncate">
              5 Hospitals &bull; RT-Sync 14ms
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

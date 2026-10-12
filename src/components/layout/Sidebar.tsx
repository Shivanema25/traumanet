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
        "fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-[#162E4A] text-slate-100 border-r border-[#203F64] flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 shadow-md",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 px-6 flex items-center justify-between border-b border-[#203F64]">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center shadow-sm group-hover:bg-red-500 transition-colors">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight flex items-center gap-1">
                Trauma<span className="text-red-400">Net</span>
              </span>
              <p className="text-[10px] text-slate-300 font-mono tracking-wider uppercase">
                Emergency Logistics
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
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all",
                  isActive
                    ? "bg-[#254A74] text-white font-semibold shadow-xs"
                    : "text-slate-300 hover:text-white hover:bg-[#1D3B5E]"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive ? "text-red-400" : "text-slate-400"
                    )}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={cn(
                      "text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-wider",
                      item.badgeVariant === "emergency" &&
                        "bg-red-500/20 text-red-300 border border-red-400/40",
                      item.badgeVariant === "electric" &&
                        "bg-blue-500/20 text-blue-300 border border-blue-400/40",
                      item.badgeVariant === "success" &&
                        "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
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
      <div className="p-4 border-t border-[#203F64] bg-[#11243A]">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#183353] border border-[#23456C]">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-slate-100 truncate">
              Nagpur Mesh Online
            </p>
            <p className="text-[10px] text-slate-300 font-mono truncate">
              5 Hospitals &bull; RT-Sync 14ms
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

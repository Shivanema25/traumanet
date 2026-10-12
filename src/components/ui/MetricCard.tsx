import React from "react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  variant?: "default" | "emergency" | "success" | "electric" | "warning";
  className?: string;
}

export function MetricCard({
  title,
  value,
  unit,
  subtitle,
  icon,
  trend,
  variant = "default",
  className,
}: MetricCardProps) {
  const borderVariants = {
    default: "border-slate-800/80 bg-slate-900/70",
    emergency: "border-red-900/60 bg-red-950/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]",
    success: "border-emerald-900/60 bg-emerald-950/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]",
    electric: "border-blue-900/60 bg-blue-950/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]",
    warning: "border-amber-900/60 bg-amber-950/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]",
  };

  const iconBg = {
    default: "bg-slate-800 text-slate-300",
    emergency: "bg-red-500/20 text-red-400 border border-red-500/30",
    success: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    electric: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    warning: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  };

  return (
    <div
      className={cn(
        "p-4 rounded-2xl border backdrop-blur-md flex flex-col justify-between transition-all",
        borderVariants[variant],
        className
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs uppercase font-medium tracking-wider text-slate-400">
          {title}
        </span>
        {icon && (
          <div className={cn("p-2 rounded-xl flex items-center justify-center", iconBg[variant])}>
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1.5 my-1">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100 font-mono">
          {value}
        </span>
        {unit && <span className="text-xs text-slate-400 font-mono">{unit}</span>}
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-xs">
        {subtitle && <span className="text-slate-400 truncate">{subtitle}</span>}
        {trend && (
          <span
            className={cn(
              "font-mono font-medium ml-auto",
              trend.isPositive ? "text-emerald-400" : "text-amber-400"
            )}
          >
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}

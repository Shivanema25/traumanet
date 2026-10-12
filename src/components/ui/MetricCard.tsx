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
    default: "border-slate-300 border-l-4 border-l-slate-400 bg-white shadow-xs",
    emergency: "border-red-200 border-l-4 border-l-red-600 bg-white shadow-xs",
    success: "border-emerald-200 border-l-4 border-l-emerald-600 bg-white shadow-xs",
    electric: "border-blue-200 border-l-4 border-l-blue-600 bg-white shadow-xs",
    warning: "border-amber-200 border-l-4 border-l-amber-500 bg-white shadow-xs",
  };

  const iconBg = {
    default: "bg-slate-100 text-slate-700",
    emergency: "bg-red-50 text-red-600 border border-red-200",
    success: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    electric: "bg-blue-50 text-blue-600 border border-blue-200",
    warning: "bg-amber-50 text-amber-600 border border-amber-200",
  };

  return (
    <div
      className={cn(
        "p-4 rounded-xl border flex flex-col justify-between transition-all",
        borderVariants[variant],
        className
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs uppercase font-semibold tracking-wide text-slate-500">
          {title}
        </span>
        {icon && (
          <div className={cn("p-2 rounded-lg flex items-center justify-center", iconBg[variant])}>
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1.5 my-1">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono">
          {value}
        </span>
        {unit && <span className="text-xs text-slate-500 font-mono font-medium">{unit}</span>}
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
        {subtitle && <span className="text-slate-500 truncate">{subtitle}</span>}
        {trend && (
          <span
            className={cn(
              "font-mono font-semibold ml-auto text-[11px]",
              trend.isPositive ? "text-emerald-700" : "text-amber-700"
            )}
          >
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}

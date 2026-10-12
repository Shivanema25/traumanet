import React from "react";
import { EmergencyStatus } from "@/types";
import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status: EmergencyStatus;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function StatusIndicator({
  status,
  size = "md",
  showLabel = true,
  className,
}: StatusIndicatorProps) {
  const configs: Record<
    EmergencyStatus,
    { label: string; dot: string; ping: string; text: string; bg: string; border: string }
  > = {
    ROUTING: {
      label: "AI ROUTING IN PROGRESS",
      dot: "bg-blue-600",
      ping: "bg-blue-400",
      text: "text-blue-800",
      bg: "bg-blue-50",
      border: "border-blue-300",
    },
    SOFT_LOCKED: {
      label: "ICU BED SOFT-LOCKED (15 MIN)",
      dot: "bg-emerald-600",
      ping: "bg-emerald-400",
      text: "text-emerald-800",
      bg: "bg-emerald-50",
      border: "border-emerald-300",
    },
    EN_ROUTE: {
      label: "AMBULANCE EN ROUTE",
      dot: "bg-amber-600",
      ping: "bg-amber-400",
      text: "text-amber-800",
      bg: "bg-amber-50",
      border: "border-amber-300",
    },
    ARRIVED: {
      label: "PATIENT DELIVERED AT ER",
      dot: "bg-teal-600",
      ping: "bg-teal-400",
      text: "text-teal-800",
      bg: "bg-teal-50",
      border: "border-teal-300",
    },
    RESOLVED: {
      label: "HANDOVER COMPLETED",
      dot: "bg-slate-500",
      ping: "bg-slate-400",
      text: "text-slate-700",
      bg: "bg-slate-100",
      border: "border-slate-300",
    },
    DIVERTED: {
      label: "CRITICAL DIVERSION",
      dot: "bg-red-600",
      ping: "bg-red-400",
      text: "text-red-800",
      bg: "bg-red-50",
      border: "border-red-300",
    },
  };

  const current = configs[status] || configs.ROUTING;

  const sizeStyles = {
    sm: "px-2.5 py-1 text-[11px]",
    md: "px-3 py-1.5 text-xs",
    lg: "px-4 py-2 text-sm font-semibold",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border font-mono uppercase tracking-wider font-semibold shadow-2xs",
        current.bg,
        current.border,
        current.text,
        sizeStyles[size],
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", current.ping)}
        />
        <span className={cn("relative inline-flex rounded-full h-2 w-2", current.dot)} />
      </span>
      {showLabel && <span>{current.label}</span>}
    </div>
  );
}

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
      dot: "bg-blue-500",
      ping: "bg-blue-400",
      text: "text-blue-400",
      bg: "bg-blue-950/70",
      border: "border-blue-700/60",
    },
    SOFT_LOCKED: {
      label: "ICU BED SOFT-LOCKED (15 MIN)",
      dot: "bg-emerald-500",
      ping: "bg-emerald-400",
      text: "text-emerald-400",
      bg: "bg-emerald-950/70",
      border: "border-emerald-700/60",
    },
    EN_ROUTE: {
      label: "AMBULANCE EN ROUTE",
      dot: "bg-amber-500",
      ping: "bg-amber-400",
      text: "text-amber-400",
      bg: "bg-amber-950/70",
      border: "border-amber-700/60",
    },
    ARRIVED: {
      label: "PATIENT DELIVERED AT ER",
      dot: "bg-cyan-500",
      ping: "bg-cyan-400",
      text: "text-cyan-400",
      bg: "bg-cyan-950/70",
      border: "border-cyan-700/60",
    },
    RESOLVED: {
      label: "HANDOVER COMPLETED",
      dot: "bg-slate-400",
      ping: "bg-slate-400",
      text: "text-slate-300",
      bg: "bg-slate-900",
      border: "border-slate-700",
    },
    DIVERTED: {
      label: "CRITICAL DIVERSION",
      dot: "bg-red-500",
      ping: "bg-red-400",
      text: "text-red-400",
      bg: "bg-red-950/80",
      border: "border-red-600/70",
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
        "inline-flex items-center gap-2 rounded-full border backdrop-blur font-mono uppercase tracking-wider",
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

import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "emergency" | "success" | "warning" | "electric" | "neutral";
  size?: "sm" | "md";
  dot?: boolean;
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-slate-800 text-slate-300 border-slate-700",
    emergency: "bg-red-950/70 text-red-300 border-red-700/60 shadow-[0_0_12px_rgba(239,68,68,0.25)]",
    success: "bg-emerald-950/70 text-emerald-300 border-emerald-700/60 shadow-[0_0_12px_rgba(16,185,129,0.25)]",
    warning: "bg-amber-950/70 text-amber-300 border-amber-700/60 shadow-[0_0_12px_rgba(245,158,11,0.25)]",
    electric: "bg-blue-950/70 text-blue-300 border-blue-700/60 shadow-[0_0_12px_rgba(59,130,246,0.25)]",
    neutral: "bg-slate-800/80 text-slate-400 border-slate-700/70",
  };

  const dotColors = {
    default: "bg-slate-400",
    emergency: "bg-red-500 animate-pulse",
    success: "bg-emerald-400",
    warning: "bg-amber-400 animate-pulse",
    electric: "bg-blue-400 animate-pulse",
    neutral: "bg-slate-500",
  };

  const sizeStyles = {
    sm: "text-[10px] font-semibold px-2 py-0.5 tracking-wider uppercase",
    md: "text-xs font-medium px-2.5 py-1 tracking-wide",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-mono transition-colors",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full", dotColors[variant])} />}
      {children}
    </span>
  );
}

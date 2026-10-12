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
    default: "bg-slate-100 text-slate-700 border-slate-300",
    emergency: "bg-red-50 text-red-700 border-red-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    electric: "bg-blue-50 text-blue-700 border-blue-200",
    neutral: "bg-slate-100 text-slate-600 border-slate-200",
  };

  const dotColors = {
    default: "bg-slate-500",
    emergency: "bg-red-600 animate-pulse",
    success: "bg-emerald-600",
    warning: "bg-amber-600 animate-pulse",
    electric: "bg-blue-600 animate-pulse",
    neutral: "bg-slate-400",
  };

  const sizeStyles = {
    sm: "text-[10px] font-semibold px-2 py-0.5 tracking-wide uppercase",
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

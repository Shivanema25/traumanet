"use client";

import React, { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "emergency" | "success" | "warning" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2.5 gap-2",
      lg: "text-base px-5 py-3 gap-2.5 font-semibold",
    };

    const variantStyles = {
      primary:
        "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 focus:ring-blue-500 border border-blue-500/40",
      emergency:
        "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 focus:ring-red-500 border border-red-500/50 animate-none",
      success:
        "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 focus:ring-emerald-500 border border-emerald-500/40",
      warning:
        "bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/25 focus:ring-amber-500 border border-amber-500/40",
      outline:
        "bg-slate-900/60 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-slate-600 focus:ring-slate-500",
      ghost:
        "bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-slate-100 focus:ring-slate-500",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";

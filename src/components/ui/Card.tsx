import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "emergency" | "electric" | "success" | "interactive";
}

export function Card({ className, variant = "default", children, ...props }: CardProps) {
  const variantStyles = {
    default: "bg-slate-900/80 border-slate-800/80 text-slate-100",
    emergency: "bg-slate-900/85 border-red-900/60 shadow-[0_0_25px_rgba(239,68,68,0.15)] text-slate-100",
    electric: "bg-slate-900/85 border-blue-900/60 shadow-[0_0_25px_rgba(59,130,246,0.15)] text-slate-100",
    success: "bg-slate-900/85 border-emerald-900/60 shadow-[0_0_25px_rgba(16,185,129,0.15)] text-slate-100",
    interactive: "bg-slate-900/75 border-slate-800 hover:border-slate-700 transition-all hover:bg-slate-850 cursor-pointer text-slate-100",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border backdrop-blur-md shadow-2xl transition-all duration-200 overflow-hidden",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-5 py-4 border-b border-slate-800/70 flex flex-col gap-1", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("font-semibold text-slate-100 tracking-tight text-base sm:text-lg flex items-center gap-2", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-xs text-slate-400 font-normal leading-relaxed", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-5", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-5 py-3.5 border-t border-slate-800/70 bg-slate-950/40 flex items-center justify-between", className)}
      {...props}
    >
      {children}
    </div>
  );
}

import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "emergency" | "electric" | "success" | "interactive";
}

export function Card({ className, variant = "default", children, ...props }: CardProps) {
  const variantStyles = {
    default: "bg-white border-slate-300 text-slate-900",
    emergency: "bg-white border-red-300 ring-1 ring-red-200 text-slate-900 shadow-xs",
    electric: "bg-white border-blue-300 ring-1 ring-blue-200 text-slate-900 shadow-xs",
    success: "bg-white border-emerald-300 ring-1 ring-emerald-200 text-slate-900 shadow-xs",
    interactive: "bg-white border-slate-300 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all text-slate-900",
  };

  return (
    <div
      className={cn(
        "rounded-xl border shadow-xs transition-all duration-150 overflow-hidden",
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
      className={cn("px-5 py-4 border-b border-slate-200 flex flex-col gap-1 bg-slate-50/70", className)}
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
      className={cn("font-bold text-slate-900 tracking-tight text-base sm:text-lg flex items-center gap-2", className)}
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
    <p className={cn("text-xs text-slate-600 font-normal leading-relaxed", className)} {...props}>
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
      className={cn("px-5 py-3.5 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between", className)}
      {...props}
    >
      {children}
    </div>
  );
}

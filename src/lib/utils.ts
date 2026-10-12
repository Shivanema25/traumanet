import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return isoString;
  }
}

export function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

export function getTraumaScoreBadge(score: number): {
  label: string;
  badgeClass: string;
} {
  if (score >= 8.0) {
    return {
      label: "PRIORITY 1 - RESUSCITATION",
      badgeClass: "bg-red-950/80 text-red-400 border border-red-600/60 shadow-[0_0_15px_rgba(239,68,68,0.3)]",
    };
  }
  if (score >= 5.0) {
    return {
      label: "PRIORITY 2 - EMERGENT",
      badgeClass: "bg-amber-950/80 text-amber-400 border border-amber-600/60",
    };
  }
  return {
    label: "PRIORITY 3 - STABLE",
    badgeClass: "bg-emerald-950/80 text-emerald-400 border border-emerald-600/60",
  };
}

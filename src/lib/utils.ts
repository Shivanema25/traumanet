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
      badgeClass: "bg-red-50 text-red-700 border border-red-300 font-bold",
    };
  }
  if (score >= 5.0) {
    return {
      label: "PRIORITY 2 - EMERGENT",
      badgeClass: "bg-amber-50 text-amber-800 border border-amber-300 font-bold",
    };
  }
  return {
    label: "PRIORITY 3 - STABLE",
    badgeClass: "bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold",
  };
}

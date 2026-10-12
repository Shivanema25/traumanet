import React from "react";
import { Vitals } from "@/types";
import { Activity, Heart, Wind, Gauge, AlertTriangle } from "lucide-react";
import { cn, formatTime } from "@/lib/utils";

interface VitalMonitorProps {
  vitals: Vitals;
  className?: string;
  isCompact?: boolean;
}

export function VitalMonitor({ vitals, className, isCompact = false }: VitalMonitorProps) {
  const isHypotensive = vitals.bloodPressureSystolic < 90;
  const isTachycardic = vitals.pulseBpm > 110;
  const isHypoxic = vitals.spO2Percent < 90;
  const isTachypneic = vitals.respiratoryRate > 24;

  const cards = [
    {
      label: "Blood Pressure",
      value: `${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic}`,
      unit: "mmHg",
      icon: Gauge,
      isWarning: isHypotensive,
      warningText: isHypotensive ? "HYPOTENSION" : "NORMAL",
      color: isHypotensive ? "text-red-700" : "text-slate-900",
      accent: isHypotensive ? "border-red-300 bg-red-50/80" : "border-slate-200 bg-slate-50/90",
    },
    {
      label: "Pulse / HR",
      value: vitals.pulseBpm,
      unit: "BPM",
      icon: Heart,
      isWarning: isTachycardic,
      warningText: isTachycardic ? "TACHYCARDIA" : "NORMAL",
      color: isTachycardic ? "text-amber-700" : "text-slate-900",
      accent: isTachycardic ? "border-amber-300 bg-amber-50/80" : "border-slate-200 bg-slate-50/90",
    },
    {
      label: "SpO2 Oxygen",
      value: `${vitals.spO2Percent}%`,
      unit: "Sat",
      icon: Wind,
      isWarning: isHypoxic,
      warningText: isHypoxic ? "CRITICAL HYPOXIA" : "ADEQUATE",
      color: isHypoxic ? "text-red-700" : "text-slate-900",
      accent: isHypoxic ? "border-red-300 bg-red-50/80" : "border-slate-200 bg-slate-50/90",
    },
    {
      label: "Respiratory Rate",
      value: vitals.respiratoryRate,
      unit: "/min",
      icon: Activity,
      isWarning: isTachypneic,
      warningText: isTachypneic ? "TACHYPNEA" : "NORMAL",
      color: isTachypneic ? "text-amber-700" : "text-slate-900",
      accent: isTachypneic ? "border-amber-300 bg-amber-50/80" : "border-slate-200 bg-slate-50/90",
    },
  ];

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-red-600 animate-pulse" />
          Paramedic Live Telemetry Feed
        </span>
        <span className="font-mono text-slate-500">
          Last Sync: {formatTime(vitals.recordedAt)}
        </span>
      </div>

      <div className={cn("grid gap-3", isCompact ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-4")}>
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className={cn(
                "p-3.5 rounded-xl border transition-all flex flex-col justify-between shadow-2xs",
                c.accent
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-slate-600">{c.label}</span>
                <Icon className={cn("w-4 h-4", c.isWarning ? "text-red-600" : "text-slate-500")} />
              </div>

              <div className="flex items-baseline gap-1 my-1">
                <span className={cn("text-2xl font-bold font-mono tracking-tight", c.color)}>
                  {c.value}
                </span>
                <span className="text-[10px] text-slate-500 font-mono font-medium">{c.unit}</span>
              </div>

              <div className="mt-1 pt-1.5 border-t border-slate-200/80 flex items-center justify-between">
                <span
                  className={cn(
                    "text-[10px] font-mono font-bold tracking-wide",
                    c.isWarning ? "text-red-700" : "text-emerald-700"
                  )}
                >
                  {c.warningText}
                </span>
                {c.isWarning && <AlertTriangle className="w-3.5 h-3.5 text-red-600" />}
              </div>
            </div>
          );
        })}
      </div>

      {vitals.gcsScore !== undefined && (
        <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-600 font-semibold">GLASGOW COMA SCALE (GCS)</span>
          <span className={cn("font-bold", vitals.gcsScore <= 8 ? "text-red-700" : "text-amber-700")}>
            {vitals.gcsScore} / 15 ({vitals.gcsScore <= 8 ? "Severe Impairment" : "Moderate Impairment"})
          </span>
        </div>
      )}
    </div>
  );
}

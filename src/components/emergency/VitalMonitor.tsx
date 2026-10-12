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
      color: isHypotensive ? "text-red-400" : "text-slate-100",
      accent: isHypotensive ? "border-red-900/60 bg-red-950/20" : "border-slate-800 bg-slate-900/60",
    },
    {
      label: "Pulse / HR",
      value: vitals.pulseBpm,
      unit: "BPM",
      icon: Heart,
      isWarning: isTachycardic,
      warningText: isTachycardic ? "TACHYCARDIA" : "NORMAL",
      color: isTachycardic ? "text-amber-400" : "text-slate-100",
      accent: isTachycardic ? "border-amber-900/60 bg-amber-950/20" : "border-slate-800 bg-slate-900/60",
    },
    {
      label: "SpO2 Oxygen",
      value: `${vitals.spO2Percent}%`,
      unit: "Sat",
      icon: Wind,
      isWarning: isHypoxic,
      warningText: isHypoxic ? "CRITICAL HYPOXIA" : "ADEQUATE",
      color: isHypoxic ? "text-red-400" : "text-slate-100",
      accent: isHypoxic ? "border-red-900/60 bg-red-950/20" : "border-slate-800 bg-slate-900/60",
    },
    {
      label: "Respiratory Rate",
      value: vitals.respiratoryRate,
      unit: "/min",
      icon: Activity,
      isWarning: isTachypneic,
      warningText: isTachypneic ? "TACHYPNEA" : "NORMAL",
      color: isTachypneic ? "text-amber-400" : "text-slate-100",
      accent: isTachypneic ? "border-amber-900/60 bg-amber-950/20" : "border-slate-800 bg-slate-900/60",
    },
  ];

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-red-500 animate-pulse" />
          Paramedic Live Telemetry Feed
        </span>
        <span className="font-mono text-slate-400">
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
                "p-3.5 rounded-xl border backdrop-blur-md transition-all flex flex-col justify-between",
                c.accent
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium text-slate-400">{c.label}</span>
                <Icon className={cn("w-4 h-4", c.isWarning ? "text-red-400 animate-pulse" : "text-slate-400")} />
              </div>

              <div className="flex items-baseline gap-1 my-1">
                <span className={cn("text-2xl font-bold font-mono tracking-tight", c.color)}>
                  {c.value}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{c.unit}</span>
              </div>

              <div className="mt-1 pt-1.5 border-t border-slate-800/60 flex items-center justify-between">
                <span
                  className={cn(
                    "text-[10px] font-mono font-medium tracking-wider",
                    c.isWarning ? "text-red-400" : "text-emerald-400"
                  )}
                >
                  {c.warningText}
                </span>
                {c.isWarning && <AlertTriangle className="w-3 h-3 text-red-400" />}
              </div>
            </div>
          );
        })}
      </div>

      {vitals.gcsScore !== undefined && (
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">GLASGOW COMA SCALE (GCS)</span>
          <span className={cn("font-bold", vitals.gcsScore <= 8 ? "text-red-400" : "text-amber-400")}>
            {vitals.gcsScore} / 15 ({vitals.gcsScore <= 8 ? "Severe Impairment" : "Moderate Impairment"})
          </span>
        </div>
      )}
    </div>
  );
}

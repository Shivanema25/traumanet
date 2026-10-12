"use client";

import React from "react";
import { Hospital } from "@/types";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Building2, Bed, ShieldCheck, Clock, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

interface HospitalCardProps {
  hospital: Hospital;
  etaMinutes?: number;
  distanceKm?: number;
  isRecommended?: boolean;
  onSoftLock?: (hospital: Hospital) => void;
  isSoftLocked?: boolean;
}

export function HospitalCard({
  hospital,
  etaMinutes,
  distanceKm,
  isRecommended = false,
  onSoftLock,
  isSoftLocked = false,
}: HospitalCardProps) {
  const isBedsCritical = hospital.availableIcuBeds <= 2;

  return (
    <Card
      variant={isSoftLocked ? "success" : isRecommended ? "electric" : "default"}
      className="relative transition-all hover:border-slate-700"
    >
      {isRecommended && (
        <div className="bg-blue-600/20 border-b border-blue-500/30 px-4 py-1 flex items-center justify-between text-[11px] font-mono text-blue-300">
          <span className="flex items-center gap-1.5 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            AI OPTIMAL LEVEL-1 MATCH
          </span>
          {etaMinutes && <span>ETA: ~{etaMinutes} MINS</span>}
        </div>
      )}

      <CardContent className="space-y-4">
        {/* Title & Trauma Level */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-bold text-slate-100 text-base leading-snug flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>{hospital.name}</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">{hospital.address}</p>
          </div>
          <Badge
            variant={hospital.traumaLevel === "LEVEL_1" ? "emergency" : "neutral"}
            size="sm"
          >
            {hospital.traumaLevel.replace("_", " ")}
          </Badge>
        </div>

        {/* Metrics Row: ICU Beds, Dependability, ETA */}
        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 font-mono text-center">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Open ICU Beds</span>
            <span
              className={cn(
                "text-base font-bold",
                isBedsCritical ? "text-amber-400" : "text-emerald-400"
              )}
            >
              {hospital.availableIcuBeds} <span className="text-xs text-slate-400">/ {hospital.totalIcuBeds}</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Reliability</span>
            <span className="text-base font-bold text-blue-400">
              {hospital.dependabilityScore}%
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Corridor ETA</span>
            <span className="text-base font-bold text-slate-100">
              {etaMinutes ? `${etaMinutes}m` : `${hospital.currentWaitTimeMinutes}m ER`}
            </span>
          </div>
        </div>

        {/* Capabilities Pills */}
        <div className="flex flex-wrap gap-1.5">
          {hospital.capabilities.slice(0, 4).map((cap, i) => (
            <span
              key={i}
              className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800/70 border border-slate-700/60 text-slate-300"
            >
              {cap}
            </span>
          ))}
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-slate-800/70 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>ER Wait: {hospital.currentWaitTimeMinutes}m</span>
          </div>

          {onSoftLock && (
            <Button
              size="sm"
              variant={isSoftLocked ? "success" : "primary"}
              onClick={() => onSoftLock(hospital)}
              disabled={hospital.availableIcuBeds === 0 || isSoftLocked}
              leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
            >
              {isSoftLocked ? "ICU Soft-Locked" : "Soft-Lock Bed"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

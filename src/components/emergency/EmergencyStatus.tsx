"use client";

import React, { useState, useEffect } from "react";
import { EmergencySession } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { Button } from "@/components/ui/Button";
import { Ambulance, Building2, Clock, ShieldAlert, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface EmergencyStatusProps {
  session: EmergencySession;
  onRefresh?: () => void;
}

export function EmergencyStatus({ session }: EmergencyStatusProps) {
  // Soft lock countdown timer calculation
  const [timeLeftSec, setTimeLeftSec] = useState<number>(0);

  useEffect(() => {
    if (!session.softLockExpiresAt) {
      setTimeLeftSec(0);
      return;
    }

    const updateTimer = () => {
      const diff = Math.max(
        0,
        Math.floor((new Date(session.softLockExpiresAt!).getTime() - Date.now()) / 1000)
      );
      setTimeLeftSec(diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [session.softLockExpiresAt]);

  const minutes = Math.floor(timeLeftSec / 60);
  const seconds = timeLeftSec % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const progressPercent = Math.min(100, Math.max(0, (timeLeftSec / (15 * 60)) * 100));

  return (
    <Card variant="emergency" className="relative overflow-hidden">
      {/* Top Incident Banner */}
      <div className="bg-slate-950/70 px-5 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-slate-100">
                {session.incidentId}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Unit {session.ambulanceId}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Paramedic: {session.paramedicId} &bull; Wardha Road Accident Corridor
            </p>
          </div>
        </div>

        <StatusIndicator status={session.status} size="sm" />
      </div>

      <CardContent className="space-y-4">
        {/* Soft-lock alert & countdown */}
        {session.status === "SOFT_LOCKED" && (
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Clock className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-300">
                  Target Destination: {session.targetHospitalName || "AIIMS Nagpur"}
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  Guaranteed 15-Minute Soft-Lock Reservation Active
                </p>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-emerald-800/60 sm:pl-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block">
                Time Remaining
              </span>
              <span className="text-2xl font-bold font-mono text-emerald-300">
                {timeFormatted}
              </span>
            </div>
          </div>
        )}

        {/* Clinical notes / SBAR highlight */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1.5">
          <span className="font-mono text-slate-400 uppercase tracking-wider block text-[10px]">
            Field Situation & Paramedic Notes
          </span>
          <p className="text-slate-200 leading-relaxed">
            {session.paramedicNotes}
          </p>
        </div>

        {/* Patient and Pre-registration state */}
        {session.familyPreReg && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono p-3 rounded-xl bg-slate-950/40 border border-slate-800/80">
            <div>
              <span className="text-slate-400 text-[10px] block">Patient Name</span>
              <span className="text-slate-200 font-semibold">{session.familyPreReg.patientName}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Demographics</span>
              <span className="text-slate-200">{session.familyPreReg.age}y / {session.familyPreReg.gender}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">ABHA National ID</span>
              <span className="text-emerald-400">{session.familyPreReg.abhaId || "Pending"}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Cashless Pre-Auth</span>
              <span className="text-blue-400 font-semibold">{session.familyPreReg.preAuthStatus || "Verified"}</span>
            </div>
          </div>
        )}

        {/* Direct view switchers */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <Link href="/hospital-er">
              <Button size="sm" variant="outline" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                ER Trauma Bay View
              </Button>
            </Link>
            <Link href="/family-portal">
              <Button size="sm" variant="outline" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                Family Portal & Cashless
              </Button>
            </Link>
          </div>

          <Link href="/map">
            <Button size="sm" variant="primary" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
              Live Ambulance GPS Track
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

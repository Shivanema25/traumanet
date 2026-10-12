"use client";

import React, { useState, useEffect } from "react";
import { EmergencySession } from "@/types";
import { Card, CardContent } from "@/components/ui/Card";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { Button } from "@/components/ui/Button";
import { Clock, ShieldAlert, ArrowUpRight } from "lucide-react";
import Link from "next/link";

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

  return (
    <Card variant="emergency" className="relative overflow-hidden">
      {/* Top Incident Banner */}
      <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center text-red-600">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-slate-900">
                {session.incidentId}
              </span>
              <span className="text-xs font-mono text-slate-600">
                Unit {session.ambulanceId}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              Paramedic: {session.paramedicId} &bull; Wardha Road Corridor
            </p>
          </div>
        </div>

        <StatusIndicator status={session.status} size="sm" />
      </div>

      <CardContent className="space-y-4">
        {/* Soft-lock alert & countdown */}
        {session.status === "SOFT_LOCKED" && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700">
                <Clock className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-900">
                  Target Destination: {session.targetHospitalName || "AIIMS Nagpur"}
                </p>
                <p className="text-[11px] text-emerald-700 font-medium">
                  Guaranteed 15-Minute Soft-Lock Reservation Active
                </p>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-emerald-200 sm:pl-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-semibold block">
                Time Remaining
              </span>
              <span className="text-2xl font-bold font-mono text-emerald-800">
                {timeFormatted}
              </span>
            </div>
          </div>
        )}

        {/* Clinical notes / SBAR highlight */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
          <span className="font-mono text-slate-500 font-semibold uppercase tracking-wider block text-[10px]">
            Field Situation & Paramedic Notes
          </span>
          <p className="text-slate-800 leading-relaxed font-sans">
            {session.paramedicNotes}
          </p>
        </div>

        {/* Patient and Pre-registration state */}
        {session.familyPreReg && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-slate-500 text-[10px] block font-sans">Patient Name</span>
              <span className="text-slate-900 font-bold">{session.familyPreReg.patientName}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block font-sans">Demographics</span>
              <span className="text-slate-800">{session.familyPreReg.age}y / {session.familyPreReg.gender}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block font-sans">ABHA National ID</span>
              <span className="text-emerald-700 font-semibold">{session.familyPreReg.abhaId || "Pending"}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block font-sans">Cashless Pre-Auth</span>
              <span className="text-blue-700 font-bold">{session.familyPreReg.preAuthStatus || "Verified"}</span>
            </div>
          </div>
        )}

        {/* Direct view switchers */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200">
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

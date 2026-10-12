"use client";

import React, { useState, useEffect } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { EmergencyStatus as EmergencyStatusType, EmergencySession } from "@/types";
import { subscribeEmergencySession } from "@/lib/firestore";
import { MOCK_ACTIVE_SESSION } from "@/data/mockData";
import { formatTime, formatDate } from "@/lib/utils";
import {
  ShieldAlert,
  Ambulance,
  Building2,
  Clock,
  Heart,
  Wind,
  Gauge,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import Link from "next/link";

export default function EmergencyPage() {
  const [activeSession, setActiveSession] = useState<EmergencySession | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    const unsub = subscribeEmergencySession(MOCK_ACTIVE_SESSION.id, (s) => {
      if (s) setActiveSession(s);
    });
    return () => unsub();
  }, []);

  // Comprehensive incident history for Nagpur
  const allIncidents: EmergencySession[] = [
    activeSession || MOCK_ACTIVE_SESSION,
    {
      id: "session-ngp-408",
      incidentId: "INC-2026-108-408",
      timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      status: "RESOLVED",
      ambulanceId: "MH-31-TR-0102",
      paramedicId: "PARA-NAGPUR-02",
      paramedicNotes: "48yo female pedestrian struck by auto-rickshaw on Kamptee Road. Closed distal radius fracture, stable hemodynamics.",
      vitals: {
        bloodPressureSystolic: 128,
        bloodPressureDiastolic: 82,
        pulseBpm: 84,
        spO2Percent: 97,
        respiratoryRate: 16,
        recordedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        gcsScore: 15,
      },
      targetHospitalId: "hosp-kingsway",
      targetHospitalName: "Kingsway Hospitals",
      sbarReport: {
        situation: "Isolated closed extremity injury, stable hemodynamics.",
        background: "Low velocity pedestrian impact.",
        assessment: "Trauma Score 3.2/10 (Stable).",
        recommendation: "Orthopedic consultation and splinting.",
        traumaScore: 3.2,
        generatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        suspectedInjuries: ["Colles fracture"],
        recommendedSpecialties: ["Orthopedics"],
      },
    },
    {
      id: "session-ngp-407",
      incidentId: "INC-2026-108-407",
      timestamp: new Date(Date.now() - 9 * 3600 * 1000).toISOString(),
      status: "RESOLVED",
      ambulanceId: "MH-31-TR-0105",
      paramedicId: "PARA-NAGPUR-01",
      paramedicNotes: "22yo male, rollover collision on Samruddhi Mahamarg near Jamtha. Suspected cervical strain, helmet preserved.",
      vitals: {
        bloodPressureSystolic: 118,
        bloodPressureDiastolic: 76,
        pulseBpm: 88,
        spO2Percent: 99,
        respiratoryRate: 18,
        recordedAt: new Date(Date.now() - 9 * 3600 * 1000).toISOString(),
        gcsScore: 15,
      },
      targetHospitalId: "hosp-aiims",
      targetHospitalName: "AIIMS Nagpur",
      sbarReport: {
        situation: "High-speed rollover, protective equipment deployed.",
        background: "Samruddhi expressway corridor.",
        assessment: "Trauma Score 4.1/10.",
        recommendation: "Cervical spine CT protocol.",
        traumaScore: 4.1,
        generatedAt: new Date(Date.now() - 9 * 3600 * 1000).toISOString(),
        suspectedInjuries: ["Cervical whiplash"],
        recommendedSpecialties: ["Spine / Orthopedics"],
      },
    },
  ];

  const filtered = allIncidents.filter((inc) => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "ACTIVE") return inc.status !== "RESOLVED";
    return inc.status === statusFilter;
  });

  return (
    <DashboardShell
      title="Trauma Incidents & Dispatch Log"
      subtitle="Fleet #108 Active Missions & Telemetry Records"
    >
      {/* Top Filter and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {["ALL", "ACTIVE", "SOFT_LOCKED", "RESOLVED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                statusFilter === st
                  ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/25 border border-blue-500"
                  : "bg-slate-900/70 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <Link href="/paramedic">
          <Button variant="primary" size="sm" leftIcon={<Ambulance className="w-3.5 h-3.5" />}>
            Open Paramedic Field Node
          </Button>
        </Link>
      </div>

      {/* Incidents List */}
      <div className="space-y-4">
        {filtered.map((incident) => {
          const isCurrentActive = incident.id === MOCK_ACTIVE_SESSION.id;

          return (
            <Card
              key={incident.id}
              variant={isCurrentActive ? "emergency" : "default"}
              className="p-5 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isCurrentActive
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}
                  >
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-100 text-sm sm:text-base">
                        {incident.incidentId}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Ambulance {incident.ambulanceId}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Paramedic: {incident.paramedicId} &bull; Recorded {formatTime(incident.timestamp)} ({formatDate(incident.timestamp)})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {incident.sbarReport && (
                    <Badge
                      variant={incident.sbarReport.traumaScore >= 8 ? "emergency" : "neutral"}
                      size="sm"
                    >
                      SCORE {incident.sbarReport.traumaScore}
                    </Badge>
                  )}
                  <StatusIndicator status={incident.status} size="sm" />
                </div>
              </div>

              {/* Paramedic Notes */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                  Field Assessment & Notes
                </span>
                <p className="text-slate-200 leading-relaxed font-sans">
                  {incident.paramedicNotes}
                </p>
              </div>

              {/* Vitals Snapshot */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">BP</span>
                    <span className="font-bold text-slate-200">
                      {incident.vitals.bloodPressureSystolic}/{incident.vitals.bloodPressureDiastolic}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">PULSE</span>
                    <span className="font-bold text-slate-200">
                      {incident.vitals.pulseBpm} BPM
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center gap-2">
                  <Wind className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">SPO2</span>
                    <span className="font-bold text-slate-200">
                      {incident.vitals.spO2Percent}%
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <div className="truncate">
                    <span className="text-[10px] text-slate-400 block">DESTINATION</span>
                    <span className="font-bold text-emerald-400 truncate block">
                      {incident.targetHospitalName || "Triage Pending"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  {incident.familyPreReg?.patientName ? `Patient: ${incident.familyPreReg.patientName} (${incident.familyPreReg.abhaId || "ABHA Cashless"})` : "Patient: Triage En Route"}
                </span>

                <div className="flex items-center gap-2">
                  <Link href="/hospital-er">
                    <Button size="sm" variant="outline" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                      ER Bay View
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </DashboardShell>
  );
}

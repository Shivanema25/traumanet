"use client";

import React, { useState, useEffect } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { HospitalCard } from "@/components/emergency/HospitalCard";
import { Badge } from "@/components/ui/Badge";
import { Hospital, EmergencySession } from "@/types";
import { subscribeHospitals, subscribeEmergencySession, updateEmergencySession } from "@/lib/firestore";
import { MOCK_ACTIVE_SESSION } from "@/data/mockData";
import { ShieldCheck, Phone, MapPin } from "lucide-react";

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [session, setSession] = useState<EmergencySession | null>(null);

  useEffect(() => {
    const unsubHosp = subscribeHospitals(setHospitals);
    const unsubSess = subscribeEmergencySession(MOCK_ACTIVE_SESSION.id, (s) => {
      if (s) setSession(s);
    });
    return () => {
      unsubHosp();
      unsubSess();
    };
  }, []);

  const handleSoftLock = async (h: Hospital) => {
    if (!session) return;
    await updateEmergencySession(session.id, {
      status: "SOFT_LOCKED",
      targetHospitalId: h.id,
      targetHospitalName: h.name,
      softLockExpiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      softLockVerified: true,
    });
  };

  return (
    <DashboardShell
      title="Trauma Centers & ICU Network"
      subtitle="Nagpur Verified Golden Hour Partner Hospitals (5 Regional Hubs)"
    >
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-white border border-slate-300 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Guaranteed Emergency Bed Reservation Protocol</span>
          </h3>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            All participating trauma facilities adhere to the Supreme Court Emergency Care Directive and TraumaNet 15-minute soft-lock protocol. Bed holds cannot be refused during critical transit.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <Badge variant="success" size="md">
            All 5 Hubs Connected
          </Badge>
        </div>
      </div>

      {/* Hospitals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {hospitals.map((hospital) => (
          <div key={hospital.id} className="space-y-2">
            <HospitalCard
              hospital={hospital}
              isSoftLocked={session?.targetHospitalId === hospital.id}
              onSoftLock={handleSoftLock}
            />
            {/* Quick Contact & Address */}
            <div className="px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between text-[11px] font-mono text-slate-600">
              <span className="flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{hospital.address}</span>
              </span>
              <a
                href={`tel:${hospital.phone}`}
                className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 shrink-0 ml-2"
              >
                <Phone className="w-3 h-3" />
                <span>Call ER</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}

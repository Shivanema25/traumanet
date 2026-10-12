"use client";

import React, { useState, useEffect } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { MetricCard } from "@/components/ui/MetricCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { VitalMonitor } from "@/components/emergency/VitalMonitor";
import { HospitalCard } from "@/components/emergency/HospitalCard";
import { EmergencyStatus } from "@/components/emergency/EmergencyStatus";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmergencySession, Hospital, HospitalRecommendation } from "@/types";
import { subscribeEmergencySession, subscribeHospitals, updateEmergencySession } from "@/lib/firestore";
import { rankHospitalsAndRoute } from "@/services/maps";
import {
  Activity,
  Ambulance,
  Bed,
  Building2,
  Clock,
  MapPin,
  ShieldAlert,
  Sparkles,
  ArrowUpRight,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [session, setSession] = useState<EmergencySession | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [recommendations, setRecommendations] = useState<HospitalRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to real-time emergency session & hospitals
  useEffect(() => {
    const unsubSession = subscribeEmergencySession("session-ngp-409", (s) => {
      if (s) setSession(s);
    });

    const unsubHospitals = subscribeHospitals((hList) => {
      setHospitals(hList);
    });

    return () => {
      unsubSession();
      unsubHospitals();
    };
  }, []);

  // Compute live hospital recommendations when session vitals/coords change
  useEffect(() => {
    async function updateRankings() {
      if (!session) return;
      const origin = session.liveCoordinates || { lat: 21.0850, lng: 79.0600 };
      const score = session.sbarReport?.traumaScore || 7.5;
      const recs = await rankHospitalsAndRoute(origin, score);
      setRecommendations(recs);
      setLoading(false);
    }
    updateRankings();
  }, [session]);

  const handleSoftLock = async (hospital: Hospital) => {
    if (!session) return;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    await updateEmergencySession(session.id, {
      status: "SOFT_LOCKED",
      targetHospitalId: hospital.id,
      targetHospitalName: hospital.name,
      softLockExpiresAt: expiresAt,
      softLockVerified: true,
    });
  };

  const totalOpenBeds = hospitals.reduce((acc, h) => acc + h.availableIcuBeds, 0);
  const totalBeds = hospitals.reduce((acc, h) => acc + h.totalIcuBeds, 0);

  return (
    <DashboardShell
      title="TraumaNet Mission Control"
      subtitle="Real-Time Emergency Logistics &bull; Nagpur Pilot Sector #108"
    >
      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Emergencies"
          value={session ? "1 CRITICAL" : "0"}
          subtitle="Wardha Road Corridor"
          icon={<ShieldAlert className="w-4 h-4 text-red-400" />}
          variant="emergency"
          trend={{ value: "+1 call", isPositive: false }}
        />

        <MetricCard
          title="Golden Hour Transit"
          value="14.2"
          unit="min"
          subtitle="Median notification to ICU"
          icon={<Clock className="w-4 h-4 text-emerald-400" />}
          variant="success"
          trend={{ value: "-8.4 min vs standard", isPositive: true }}
        />

        <MetricCard
          title="Nagpur Network ICU"
          value={totalOpenBeds}
          unit={`/ ${totalBeds} total`}
          subtitle="5 Verified Trauma Centers"
          icon={<Bed className="w-4 h-4 text-blue-400" />}
          variant="electric"
        />

        <MetricCard
          title="Soft-Lock Hold Rate"
          value="98.4"
          unit="%"
          subtitle="Zero bed turn-aways"
          icon={<Building2 className="w-4 h-4 text-amber-400" />}
          variant="warning"
          trend={{ value: "Grade A+ Audit", isPositive: true }}
        />
      </div>

      {/* Main Grid: Active Emergency Left, Vital Monitor & Recommendations Right */}
      {session && (
        <div className="space-y-6">
          <EmergencyStatus session={session} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (5 cols): Live Patient Vitals & SBAR Intelligence */}
            <div className="lg:col-span-5 space-y-6">
              <Card variant="default">
                <CardHeader>
                  <CardTitle>
                    <Activity className="w-4 h-4 text-red-500 animate-pulse" />
                    <span>Real-Time Patient Telemetry</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <VitalMonitor vitals={session.vitals} isCompact={true} />

                  {/* Multimodal Gemini Handover Summary */}
                  {session.sbarReport && (
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-blue-400 flex items-center gap-1.5 font-semibold">
                          <Sparkles className="w-3.5 h-3.5" />
                          Gemini 1.5 Clinical SBAR Handover
                        </span>
                        <Badge
                          variant={session.sbarReport.traumaScore >= 8 ? "emergency" : "warning"}
                          size="sm"
                        >
                          TRAUMA SCORE {session.sbarReport.traumaScore}/10
                        </Badge>
                      </div>

                      <div className="text-xs text-slate-300 space-y-2 pt-1 font-sans leading-relaxed">
                        <p>
                          <strong className="text-slate-100 font-mono">Situation:</strong>{" "}
                          {session.sbarReport.situation}
                        </p>
                        <p>
                          <strong className="text-slate-100 font-mono">Assessment:</strong>{" "}
                          {session.sbarReport.assessment}
                        </p>
                        <p className="text-emerald-300">
                          <strong className="text-slate-100 font-mono">Recommendation:</strong>{" "}
                          {session.sbarReport.recommendation}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-1">
                        {session.sbarReport.suspectedInjuries.map((inj, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/50 text-red-300 border border-red-900/40"
                          >
                            {inj}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column (7 cols): Recommended Nagpur Trauma Centers */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-400" />
                    <span>AI-Ranked Receiving Hospitals</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Ranked by specialty readiness, open ICU beds, and Golden Hour corridor transit time.
                  </p>
                </div>

                <Link href="/hospitals">
                  <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                    View All {hospitals.length} Centers
                  </Button>
                </Link>
              </div>

              <div className="space-y-3">
                {recommendations.slice(0, 3).map((rec, i) => (
                  <HospitalCard
                    key={rec.hospital.id}
                    hospital={rec.hospital}
                    etaMinutes={rec.etaMinutes}
                    distanceKm={rec.distanceKm}
                    isRecommended={i === 0}
                    isSoftLocked={session.targetHospitalId === rec.hospital.id}
                    onSoftLock={handleSoftLock}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Corridor Overview Banner */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100">
              Nagpur Emergency Road Corridors Online
            </h4>
            <p className="text-xs text-slate-400">
              Wardha Road / Airport Flyover Hub &bull; Samruddhi Mahamarg Interchange &bull; Kamptee Commercial Zone
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/map">
            <Button size="sm" variant="outline" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
              Open GPS Interactive Map
            </Button>
          </Link>
          <Link href="/admin-demo">
            <Button size="sm" variant="primary">
              Demo Stage Injector
            </Button>
          </Link>
        </div>
      </div>
    </DashboardShell>
  );
}

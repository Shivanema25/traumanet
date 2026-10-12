"use client";

import React, { useState, useEffect } from "react";
import { useTraumaNet } from "@/lib/TraumaNetContext";
import {
  Building2,
  Bell,
  CheckCircle2,
  ShieldCheck,
  Activity,
  Sparkles,
  Volume2,
  VolumeX,
  Clock,
  FileText,
  Stethoscope,
  Lock,
  RefreshCw,
  AlertTriangle,
  Award,
  Zap,
  ArrowLeft,
} from "lucide-react";
import NagpurMap from "@/components/NagpurMap";
import { playErAlertChime } from "@/lib/audio";
import Link from "next/link";

export default function HospitalErPage() {
  const {
    activeSession,
    hospitals,
    activeHospital,
    acceptAndLockBed,
    declineAndReroute,
    injectEmergencyScenario,
  } = useTraumaNet();

  const [soundMuted, setSoundMuted] = useState(false);
  const [rerouting, setRerouting] = useState(false);

  // Pre-Alert checklist toggles state
  const [oNegFetched, setONegFetched] = useState(true);
  const [ctReserved, setCtReserved] = useState(true);
  const [surgeonAlerted, setSurgeonAlerted] = useState(true);

  // Soft-lock countdown state (15:00 minutes)
  const [countdownSeconds, setCountdownSeconds] = useState(15 * 60 - 1);

  useEffect(() => {
    if (!activeSession) return;
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeSession]);

  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleAccept = () => {
    if (activeSession) {
      acceptAndLockBed(activeSession.session_id);
    }
  };

  const handleDecline = () => {
    if (activeSession) {
      setRerouting(true);
      declineAndReroute(activeSession.session_id);
      setTimeout(() => setRerouting(false), 500);
    }
  };

  const handleTestChime = () => {
    if (!soundMuted) {
      playErAlertChime();
    }
  };

  const currentHospital = activeHospital || hospitals[0];
  const ranking = currentHospital.ranking_v2 || {
    dependability_score: 94.2,
    ranking_grade: "Grade A+",
    communication_freshness_sec: 12,
    equipment_readiness_pct: 98.4,
    icu_hold_reliability_pct: 96.8,
  };

  // If no inbound session yet, display clean standby screen
  if (!activeSession) {
    return (
      <div className="min-h-screen bg-[#E6EDF4] text-slate-900 p-4 md:p-8 flex items-center justify-center font-sans">
        <div className="bg-white border border-slate-200 shadow-md rounded-2xl p-8 max-w-lg text-center space-y-5">
          <div className="w-14 h-14 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-600">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{currentHospital.name}</h2>
            <p className="text-xs text-slate-500 mt-1">ER Trauma Command Tower • 108 Nagpur Emergency Pilot</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-left">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600">Hospital Dependability Score:</span>
              <span className="text-emerald-700 font-mono font-bold">{ranking.dependability_score}% ({ranking.ranking_grade})</span>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600">ICU Bed Reserve Readiness:</span>
              <span className="text-slate-900 font-mono font-bold">{currentHospital.icu_beds_free} Beds Free</span>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600">Communication Freshness:</span>
              <span className="text-blue-700 font-mono">{ranking.communication_freshness_sec}s ago</span>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Awaiting real-time paramedic transmission from Node #108.
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
            <Link
              href="/paramedic"
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs"
            >
              Open Paramedic Mobile App
            </Link>
            <button
              onClick={() => injectEmergencyScenario(0)}
              className="px-5 py-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-300 transition-colors shadow-xs"
            >
              ⚡ Inject Test Emergency Intake
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isBedLocked = activeSession.bed_status === "ACCEPTED_LOCKED";

  return (
    <div className="min-h-screen bg-[#E6EDF4] text-slate-900 p-4 md:p-8 max-w-6xl mx-auto font-sans pb-24">
      {/* Top Banner: INCOMING TRAUMA PATIENT */}
      <div className="mb-6 bg-red-600 text-white shadow-sm rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xl text-white">
            🚨
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-red-100 font-bold">
              Level 1 Emergency Broadcast • Trauma Grid #108
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              INCOMING TRAUMA PATIENT — ETA {activeSession.eta_minutes || 8} MINS
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundMuted(!soundMuted)}
            title={soundMuted ? "Unmute Alert Chime" : "Mute Alert Chime"}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-red-200" /> : <Volume2 className="w-4 h-4 text-white" />}
          </button>
          <button
            onClick={handleTestChime}
            className="px-3.5 py-2 rounded-lg bg-white text-red-600 font-bold text-xs shadow-xs hover:bg-slate-50 transition-colors"
          >
            Auditory Chime
          </button>
        </div>
      </div>

      {/* Top Hospital Command Header & Ranking v2 Metric */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-200 pb-5 mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shadow-xs">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">{currentHospital.name}</h1>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                Command Tower
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentHospital.address} • Hotline: {currentHospital.emergency_contact}
            </p>
          </div>
        </div>

        {/* Hospital Ranking v2 Metric Display */}
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              Hospital Dependability Score
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-black font-mono text-emerald-700">
                {ranking.dependability_score}%
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {ranking.ranking_grade}
              </span>
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                • Comm: {ranking.communication_freshness_sec}s
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Soft-Lock Action Bar */}
        <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Flight-Booking Soft-Lock:</span>
              <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                ⏱️ {formatCountdown(countdownSeconds)} left
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              ICU Bed #2 Reservation Hold for {activeSession.patient_info?.name || "Inbound Trauma Patient"}
            </h3>
            <p className="text-xs text-slate-500">
              Guaranteed trauma resuscitation bay assignment with zero gate delay
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            {!isBedLocked ? (
              <>
                <button
                  onClick={handleAccept}
                  className="flex-1 md:flex-none px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>🔒 ACCEPT &amp; SOFT-LOCK ICU BED #2</span>
                </button>
                <button
                  onClick={handleDecline}
                  disabled={rerouting}
                  className="px-4 py-3 bg-white hover:bg-slate-50 text-red-600 border border-slate-300 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${rerouting ? "animate-spin" : ""}`} />
                  <span>Reroute</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 px-5 py-3 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs shadow-xs">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>ICU BED #2 CONFIRMED &amp; SOFT-LOCKED</span>
              </div>
            )}
          </div>
        </div>

        {/* Gemini Structured 4-Quadrant SBAR Summary Card */}
        <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-5 md:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Gemini 1.5 SBAR Clinical Handover Report (Translated English)
              </h2>
            </div>
            <span className="text-xs px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full font-bold">
              Trauma Score: {activeSession.trauma_score} / 10 ({activeSession.severity})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Situation */}
            <div className="bg-red-50/50 p-4 rounded-lg border border-red-200 space-y-1">
              <div className="flex items-center gap-2 text-red-700 font-bold uppercase tracking-wider">
                <span className="w-4 h-4 rounded bg-red-200 flex items-center justify-center text-[10px]">S</span>
                <span>Situation</span>
              </div>
              <p className="text-slate-800 leading-relaxed font-sans">
                {activeSession.sbar?.situation || activeSession.ai_pre_report.split(".")[0] + "."}
              </p>
            </div>

            {/* Background */}
            <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-200 space-y-1">
              <div className="flex items-center gap-2 text-blue-700 font-bold uppercase tracking-wider">
                <span className="w-4 h-4 rounded bg-blue-200 flex items-center justify-center text-[10px]">B</span>
                <span>Background (Mechanisms &amp; Field Notes)</span>
              </div>
              <p className="text-slate-800 leading-relaxed font-sans">
                {activeSession.sbar?.background || activeSession.voice_notes || "Field Paramedic Intake via Nagpur 108 Vector."}
              </p>
            </div>

            {/* Assessment */}
            <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-200 space-y-1">
              <div className="flex items-center gap-2 text-amber-700 font-bold uppercase tracking-wider">
                <span className="w-4 h-4 rounded bg-amber-200 flex items-center justify-center text-[10px]">A</span>
                <span>Assessment (Vitals &amp; Vision Triage)</span>
              </div>
              <p className="text-slate-800 leading-relaxed font-sans">
                {activeSession.sbar?.assessment || activeSession.ai_pre_report}
              </p>
            </div>

            {/* Recommendation */}
            <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-200 space-y-1">
              <div className="flex items-center gap-2 text-emerald-700 font-bold uppercase tracking-wider">
                <span className="w-4 h-4 rounded bg-emerald-200 flex items-center justify-center text-[10px]">R</span>
                <span>Recommendation (ER Direct Prep)</span>
              </div>
              <p className="text-slate-800 leading-relaxed font-sans">
                {activeSession.sbar?.recommendation || "Standby trauma bay with active pan-scan CT preparation."}
              </p>
            </div>
          </div>

          {/* Injury Photo & Notes if attached */}
          {activeSession.injury_image_url && (
            <div className="pt-2 border-t border-slate-200 flex items-center gap-4">
              <img
                src={activeSession.injury_image_url}
                alt="Injury Photo"
                className="w-20 h-20 rounded-lg object-cover border border-slate-200 shrink-0"
              />
              <div className="text-xs text-slate-600">
                <span className="font-bold text-slate-800 block mb-0.5">Paramedic Multimodal Injury Vision:</span>
                <span>Visible wound analyzed by Gemini 1.5 Flash multimodal vision engine.</span>
              </div>
            </div>
          )}
        </div>

        {/* Pre-Alert Checklists (Interactive Toggles) */}
        <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-5 md:p-6 space-y-3.5">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-emerald-600" /> Pre-Arrival Rapid Checklist &amp; Blood Bank Activation
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* O-Neg Blood */}
            <button
              type="button"
              onClick={() => setONegFetched(!oNegFetched)}
              className={`p-3.5 rounded-lg border text-left transition-all flex items-center justify-between ${
                oNegFetched
                  ? "bg-red-50/60 border-red-300 shadow-xs"
                  : "bg-slate-50 border-slate-200 opacity-60"
              }`}
            >
              <div>
                <span className="text-xs font-bold text-slate-900 block">🩸 O-Neg Blood Pre-fetched</span>
                <span className="text-[11px] text-slate-500">4 PRBC Units cross-matched</span>
              </div>
              <span className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold ${oNegFetched ? "bg-red-600 text-white" : "bg-slate-200 text-slate-500"}`}>
                {oNegFetched ? "✓" : ""}
              </span>
            </button>

            {/* CT Scanner */}
            <button
              type="button"
              onClick={() => setCtReserved(!ctReserved)}
              className={`p-3.5 rounded-lg border text-left transition-all flex items-center justify-between ${
                ctReserved
                  ? "bg-blue-50/60 border-blue-300 shadow-xs"
                  : "bg-slate-50 border-slate-200 opacity-60"
              }`}
            >
              <div>
                <span className="text-xs font-bold text-slate-900 block">☢️ CT Scanner Reserved</span>
                <span className="text-[11px] text-slate-500">Pan-Scan Protocol on Standby</span>
              </div>
              <span className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold ${ctReserved ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"}`}>
                {ctReserved ? "✓" : ""}
              </span>
            </button>

            {/* On-Call Surgeon */}
            <button
              type="button"
              onClick={() => setSurgeonAlerted(!surgeonAlerted)}
              className={`p-3.5 rounded-lg border text-left transition-all flex items-center justify-between ${
                surgeonAlerted
                  ? "bg-emerald-50/60 border-emerald-300 shadow-xs"
                  : "bg-slate-50 border-slate-200 opacity-60"
              }`}
            >
              <div>
                <span className="text-xs font-bold text-slate-900 block">👨‍⚕️ On-Call Surgeon Alerted</span>
                <span className="text-[11px] text-slate-500">Trauma Surgeon en-route to Bay</span>
              </div>
              <span className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold ${surgeonAlerted ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"}`}>
                {surgeonAlerted ? "✓" : ""}
              </span>
            </button>
          </div>
        </div>

        {/* Live Ambulance Corridor Map */}
        <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-5 md:p-6 space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Nagpur Ambulance Corridor &amp; Arrival Vector (OSRM)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time route tracking between accident corridor and partner trauma centers
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-800 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              ETA ~ {activeSession.eta_minutes || 8} MINS
            </span>
          </div>
          <NagpurMap height="380px" showSoftLockAction={false} />
        </div>
      </div>
    </div>
  );
}

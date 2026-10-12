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
} from "lucide-react";
import SoftLockTimer from "@/components/SoftLockTimer";
import VitalsMonitor from "@/components/VitalsMonitor";
import LiveMap from "@/components/LiveMap";
import { playErAlertChime } from "@/lib/audio";
import Link from "next/link";

export default function HospitalErPage() {
  const {
    activeSession,
    hospitals,
    activeHospital,
    acceptAndLockBed,
    declineAndReroute,
    updatePreReservations,
    injectEmergencyScenario,
  } = useTraumaNet();

  const [soundMuted, setSoundMuted] = useState(false);
  const [rerouting, setRerouting] = useState(false);

  // Pre-Alert checklist toggles state
  const [oNegFetched, setONegFetched] = useState(true);
  const [ctReserved, setCtReserved] = useState(true);
  const [surgeonAlerted, setSurgeonAlerted] = useState(true);

  // Soft-lock countdown state (15:00 minutes)
  const [countdownSeconds, setCountdownSeconds] = useState(15 * 60);

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

  // If no inbound session yet, display pristine standby screen
  if (!activeSession) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-slate-100 p-4 md:p-8 flex items-center justify-center relative overflow-hidden font-sans">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 backdrop-blur-md bg-slate-900/80 border border-slate-800 shadow-2xl rounded-3xl p-8 max-w-lg text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8 text-[#3B82F6]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{currentHospital.name}</h2>
            <p className="text-xs text-slate-400 mt-1">ER Trauma Command Tower • 108 Nagpur Emergency Pilot</p>
          </div>
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-2 text-left">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-400">Hospital Dependability Score:</span>
              <span className="text-emerald-400 font-mono font-bold">{ranking.dependability_score}% ({ranking.ranking_grade})</span>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-400">ICU Bed Reserve Readiness:</span>
              <span className="text-white font-mono">{currentHospital.icu_beds_free} Beds Free</span>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-400">Comm Freshness:</span>
              <span className="text-blue-400 font-mono">{ranking.communication_freshness_sec}s ago</span>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Awaiting real-time paramedic transmission from Node #108.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/paramedic"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-sm"
            >
              Open Paramedic Mobile App
            </Link>
            <button
              onClick={() => injectEmergencyScenario(0)}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
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
    <div className="min-h-screen bg-[#0F172A] text-slate-100 p-4 md:p-8 max-w-6xl mx-auto font-sans pb-28 relative overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-64 left-10 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner: 🚨 INCOMING TRAUMA PATIENT - ETA 8 MINS */}
      <div className="relative z-10 mb-6 bg-gradient-to-r from-red-600/90 via-red-500/90 to-rose-600/90 border border-red-500/50 shadow-2xl rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-black/20 backdrop-blur-md flex items-center justify-center font-bold text-xl text-white">
            🚨
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-white/90 font-bold">
              Level 1 Emergency Broadcast • Trauma Grid #108
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">
              INCOMING TRAUMA PATIENT — ETA {activeSession.eta_minutes || 8} MINS
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundMuted(!soundMuted)}
            title={soundMuted ? "Unmute Alert Chime" : "Mute Alert Chime"}
            className="p-2.5 rounded-xl bg-black/25 hover:bg-black/40 text-white transition-colors"
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-red-200" /> : <Volume2 className="w-4 h-4 text-white" />}
          </button>
          <button
            onClick={handleTestChime}
            className="px-3.5 py-2 rounded-xl bg-white text-red-600 font-extrabold text-xs shadow-md hover:bg-slate-100 transition-colors"
          >
            Auditory Chime
          </button>
        </div>
      </div>

      {/* Top Hospital Command Header & Ranking v2 Metric */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800 pb-5 mb-6 gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-lg">
            <Building2 className="w-6 h-6 text-[#3B82F6]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">{currentHospital.name}</h1>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 font-bold">
                Command Tower
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentHospital.address} • Hotline: {currentHospital.emergency_contact}
            </p>
          </div>
        </div>

        {/* Hospital Ranking v2 Metric Display */}
        <div className="backdrop-blur-md bg-slate-900/90 border border-emerald-500/30 rounded-2xl px-4 py-2.5 flex items-center gap-3.5 shadow-xl">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Hospital Dependability &amp; Confidence Score
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-extrabold font-mono text-emerald-400">
                {ranking.dependability_score}%
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                {ranking.ranking_grade}
              </span>
              <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                • Comm Freshness: {ranking.communication_freshness_sec}s
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 space-y-6">
        {/* Soft-Lock Action Bar */}
        <div className="backdrop-blur-md bg-slate-900/80 border border-slate-800 shadow-2xl rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Flight-Booking Soft-Lock:</span>
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded-md border border-amber-800/40">
                ⏱️ {formatCountdown(countdownSeconds)} left
              </span>
            </div>
            <h3 className="text-base font-bold text-white">
              ICU Bed #2 Reservation Hold for {activeSession.patient_info?.name || "Inbound Trauma Patient"}
            </h3>
            <p className="text-xs text-slate-400">
              Guaranteed trauma resuscitation bay assignment with zero gate delay
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {!isBedLocked ? (
              <>
                <button
                  onClick={handleAccept}
                  className="flex-1 md:flex-none px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>🔒 ACCEPT PATIENT &amp; SOFT-LOCK ICU BED #2</span>
                </button>
                <button
                  onClick={handleDecline}
                  disabled={rerouting}
                  className="px-4 py-3.5 bg-slate-800 hover:bg-red-950 text-red-300 border border-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${rerouting ? "animate-spin" : ""}`} />
                  <span>Reroute</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-extrabold text-sm shadow-md">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>ICU BED #2 CONFIRMED &amp; SOFT-LOCKED</span>
              </div>
            )}
          </div>
        </div>

        {/* Gemini Structured 4-Quadrant SBAR Summary Card */}
        <div className="backdrop-blur-md bg-slate-900/80 border border-slate-800 shadow-2xl rounded-2xl p-5 md:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800/80 pb-3 gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Gemini 1.5 SBAR Clinical Handover Report (Translated English)
              </h2>
            </div>
            <span className="text-xs px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full font-bold">
              Trauma Score: {activeSession.trauma_score} / 10 ({activeSession.severity})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
            {/* Situation */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-[#EF4444] font-extrabold uppercase tracking-wider">
                <span className="w-5 h-5 rounded bg-red-500/20 flex items-center justify-center text-[10px]">S</span>
                <span>Situation</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-sans">
                {activeSession.sbar?.situation || activeSession.ai_pre_report.split(".")[0] + "."}
              </p>
            </div>

            {/* Background */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-[#3B82F6] font-extrabold uppercase tracking-wider">
                <span className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center text-[10px]">B</span>
                <span>Background (Mechanisms &amp; Field Notes)</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-sans">
                {activeSession.sbar?.background || activeSession.voice_notes || "Field Paramedic Intake via Nagpur 108 Vector."}
              </p>
            </div>

            {/* Assessment */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-400 font-extrabold uppercase tracking-wider">
                <span className="w-5 h-5 rounded bg-amber-500/20 flex items-center justify-center text-[10px]">A</span>
                <span>Assessment (Vitals &amp; Vision Triage)</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-sans">
                {activeSession.sbar?.assessment || activeSession.ai_pre_report}
              </p>
            </div>

            {/* Recommendation */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-[#10B981] font-extrabold uppercase tracking-wider">
                <span className="w-5 h-5 rounded bg-emerald-500/20 flex items-center justify-center text-[10px]">R</span>
                <span>Recommendation (ER Direct Prep)</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-sans">
                {activeSession.sbar?.recommendation || "Standby trauma bay with active pan-scan CT preparation."}
              </p>
            </div>
          </div>

          {/* Injury Photo & Notes if attached */}
          {activeSession.injury_image_url && (
            <div className="pt-2 border-t border-slate-800 flex items-center gap-4">
              <img
                src={activeSession.injury_image_url}
                alt="Injury Photo"
                className="w-20 h-20 rounded-xl object-cover border border-slate-700 shrink-0"
              />
              <div className="text-xs text-slate-300">
                <span className="font-bold text-slate-200 block mb-0.5">Paramedic Multimodal Injury Vision:</span>
                <span>Visible wound analyzed by Gemini 1.5 Flash multimodal vision engine.</span>
              </div>
            </div>
          )}
        </div>

        {/* Pre-Alert Checklists (Interactive Toggles) */}
        <div className="backdrop-blur-md bg-slate-900/80 border border-slate-800 shadow-2xl rounded-2xl p-5 md:p-6 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-[#10B981]" /> Pre-Arrival Rapid Checklist &amp; Blood Bank Activation
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* O-Neg Blood */}
            <button
              type="button"
              onClick={() => setONegFetched(!oNegFetched)}
              className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                oNegFetched
                  ? "bg-red-950/40 border-red-500/60 shadow-md"
                  : "bg-slate-950/80 border-slate-800 opacity-60"
              }`}
            >
              <div>
                <span className="text-xs font-bold text-white block">🩸 O-Neg Blood Pre-fetched</span>
                <span className="text-[11px] text-slate-400">4 PRBC Units cross-matched</span>
              </div>
              <span className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${oNegFetched ? "bg-red-500 text-white" : "bg-slate-800 text-slate-500"}`}>
                {oNegFetched ? "✓" : ""}
              </span>
            </button>

            {/* CT Scanner */}
            <button
              type="button"
              onClick={() => setCtReserved(!ctReserved)}
              className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                ctReserved
                  ? "bg-blue-950/40 border-blue-500/60 shadow-md"
                  : "bg-slate-950/80 border-slate-800 opacity-60"
              }`}
            >
              <div>
                <span className="text-xs font-bold text-white block">☢️ CT Scanner Reserved</span>
                <span className="text-[11px] text-slate-400">Pan-Scan Protocol on Standby</span>
              </div>
              <span className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${ctReserved ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-500"}`}>
                {ctReserved ? "✓" : ""}
              </span>
            </button>

            {/* On-Call Surgeon */}
            <button
              type="button"
              onClick={() => setSurgeonAlerted(!surgeonAlerted)}
              className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                surgeonAlerted
                  ? "bg-emerald-950/40 border-emerald-500/60 shadow-md"
                  : "bg-slate-950/80 border-slate-800 opacity-60"
              }`}
            >
              <div>
                <span className="text-xs font-bold text-white block">👨‍⚕️ On-Call Surgeon Alerted</span>
                <span className="text-[11px] text-slate-400">Trauma Surgeon en-route to Bay</span>
              </div>
              <span className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${surgeonAlerted ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-500"}`}>
                {surgeonAlerted ? "✓" : ""}
              </span>
            </button>
          </div>
        </div>

        {/* Live Ambulance Corridor Map */}
        <div className="backdrop-blur-md bg-slate-900/80 border border-slate-800 shadow-2xl rounded-2xl p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Live Ambulance Corridor &amp; Real-Time Arrival Vector
            </h3>
            <span className="text-xs font-mono text-emerald-400 font-bold">ETA ~ {activeSession.eta_minutes} MINS</span>
          </div>
          <LiveMap session={activeSession} hospitals={hospitals} height="360px" />
        </div>
      </div>
    </div>
  );
}

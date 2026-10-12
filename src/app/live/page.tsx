"use client";

import React, { useState, useEffect } from "react";
import { useTraumaNet } from "@/lib/TraumaNetContext";
import { DEMO_SCENARIOS } from "@/lib/mockData";
import {
  Ambulance,
  Building2,
  Users,
  Compass,
  Zap,
  Activity,
  ShieldCheck,
  Sparkles,
  Camera,
  Mic,
  Send,
  Lock,
  RefreshCw,
  Stethoscope,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  Upload,
  X,
  FileText,
} from "lucide-react";
import Link from "next/link";
import NagpurMap from "@/components/NagpurMap";

export default function LiveCockpitPage() {
  const {
    activeSession,
    hospitals,
    activeHospital,
    createSession,
    acceptAndLockBed,
    declineAndReroute,
    injectEmergencyScenario,
    resetAllData,
  } = useTraumaNet();

  // Active tab on mobile (pane 1, 2, or 3)
  const [mobileTab, setMobileTab] = useState<"paramedic" | "er" | "family">("er");

  // Paramedic Pane Inputs
  const [bp, setBp] = useState("90/60");
  const [pulse, setPulse] = useState("124");
  const [spo2, setSpo2] = useState("91");
  const [respRate, setRespRate] = useState("28");
  const [notes, setNotes] = useState(
    "35yo male, bike collision near Wardha flyover, severe chest trauma and blunt head injury, breathing labored"
  );
  const [loadingTriage, setLoadingTriage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // ER Checklists
  const [oNegFetched, setONegFetched] = useState(true);
  const [ctReserved, setCtReserved] = useState(true);
  const [surgeonAlerted, setSurgeonAlerted] = useState(true);

  // Soft-lock timer countdown
  const [countdownSeconds, setCountdownSeconds] = useState(15 * 60 - 1);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleParamedicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingTriage(true);

    try {
      const formData = new FormData();
      if (selectedImage) formData.append("image", selectedImage);
      formData.append(
        "vitals",
        JSON.stringify({
          bp,
          pulse: Number(pulse) || 80,
          spo2: Number(spo2) || 98,
          respRate: Number(respRate) || 16,
        })
      );
      formData.append("notes", notes);

      const res = await fetch("/api/triage", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.data) {
        createSession({
          patient_info: {
            name: "Rahul Verma",
            age: 35,
            gender: "MALE",
            blood_group: "O+",
          },
          trauma_score: data.data.trauma_score || 8.4,
          severity: data.data.urgency || "CRITICAL",
          ai_pre_report: data.data.sbar?.situation || "Critical thoracic trauma en-route",
          voice_notes: notes,
          assigned_hospital_id: hospitals[0]?.hospital_id || "hosp-kingsway-nagpur",
          bed_status: "HOLD",
          eta_minutes: 8,
          sbar: data.data.sbar,
          vitals: {
            blood_pressure_sys: parseInt(bp.split("/")[0]) || 90,
            blood_pressure_dia: parseInt(bp.split("/")[1]) || 60,
            pulse_rate: parseInt(pulse) || 124,
            spo2: parseInt(spo2) || 91,
            respiratory_rate: parseInt(respRate) || 28,
            gcs_score: 11,
            temperature_c: 36.8,
          },
        });
      }
    } catch (err) {
      console.error("Triage failed:", err);
    } finally {
      setLoadingTriage(false);
    }
  };

  const currentHospital = activeHospital || hospitals[0];
  const session = activeSession || {
    session_id: "demo-live-01",
    patient_info: { name: "Rahul Verma", age: 35, gender: "MALE" as const, blood_group: "O+" },
    trauma_score: 8.4,
    severity: "CRITICAL" as const,
    ai_pre_report: "Severe polytrauma with tension hemothorax. Urgent thoracic bay readiness required.",
    voice_notes: "35yo male, bike accident on Wardha Flyover, chest blunt injury, low BP.",
    assigned_hospital_id: currentHospital.hospital_id,
    bed_status: "HOLD" as const,
    eta_minutes: 8,
    distance_km: 7.2,
    deposit_amount_inr: 0,
    is_deposit_paid: true,
    sbar: {
      situation: "35yo male polytrauma with blunt thoracic trauma and respiratory distress.",
      background: "High-speed motorcycle collision at Wardha Road Flyover Hub.",
      assessment: "Hypotension (90/60), tachycardia (124 bpm), SpO2 91% on room air. Suspected hemopneumothorax.",
      recommendation: "Immediate trauma bay 1 standby, 4 units O-Neg cross-match, chest tube tray and pan-scan CT.",
    },
    vitals: {
      blood_pressure_sys: 90,
      blood_pressure_dia: 60,
      pulse_rate: 124,
      spo2: 91,
      respiratory_rate: 28,
      gcs_score: 11,
      temperature_c: 36.8,
    },
    pre_reservations: { blood_bank_units: 4, ct_scan_reserved: true, mri_reserved: false, or_theater_ready: true, neurosurgery_called: false, ortho_called: true, vascular_called: false, icu_team_notified: true },
    timeline: [],
  };

  const isBedLocked = session.bed_status === "ACCEPTED_LOCKED";

  return (
    <div className="min-h-screen bg-[#E6EDF4] text-slate-900 flex flex-col font-sans">
      {/* Top Cockpit Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-2.5 shadow-xs">
        <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-red-600 uppercase tracking-wider">
                  TRAUMANET LIVE 3-PANE COCKPIT
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-800 font-mono px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                  BroadcastChannel Sync Active
                </span>
              </div>
              <h1 className="text-xs sm:text-sm font-bold text-slate-800">
                Simultaneous Paramedic, ER Command Tower &amp; Family View • Nagpur Pilot Node #108
              </h1>
            </div>
          </div>

          {/* Quick Scenario Injectors & Reset */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium hidden lg:inline mr-1">Inject Case:</span>
            {DEMO_SCENARIOS.map((sc, i) => (
              <button
                key={i}
                onClick={() => injectEmergencyScenario(i)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Zap className="w-3 h-3 text-amber-600 fill-current" />
                <span>Case #{i + 1}</span>
              </button>
            ))}
            <button
              onClick={resetAllData}
              title="Reset data"
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer ml-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile View Switcher */}
        <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-100 md:hidden text-xs">
          <button
            onClick={() => setMobileTab("paramedic")}
            className={`py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 ${
              mobileTab === "paramedic" ? "bg-red-600 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            <Ambulance className="w-3.5 h-3.5" /> Paramedic
          </button>
          <button
            onClick={() => setMobileTab("er")}
            className={`py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 ${
              mobileTab === "er" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> ER Command
          </button>
          <button
            onClick={() => setMobileTab("family")}
            className={`py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 ${
              mobileTab === "family" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Family &amp; Map
          </button>
        </div>
      </header>

      {/* Main 3-Pane Split Grid */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto p-3 grid grid-cols-1 md:grid-cols-3 gap-3 overflow-hidden">
        {/* PANE 1: PARAMEDIC FLEET NODE #108 */}
        <section
          className={`flex flex-col bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3.5 overflow-y-auto max-h-[calc(100vh-105px)] ${
            mobileTab === "paramedic" ? "block" : "hidden md:flex"
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 border border-red-200 flex items-center justify-center">
                <Ambulance className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  1. Paramedic Mobile Terminal
                </h2>
                <span className="text-[10px] font-mono text-red-600">Node #108 • Wardha Vector</span>
              </div>
            </div>
            <Link
              href="/paramedic"
              target="_blank"
              className="text-[11px] text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium"
            >
              <span>Full Tab</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {/* Manual Vitals Grid */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
              Manual Field Vitals
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 border border-slate-300 rounded-lg p-2.5">
                <span className="text-[10px] text-slate-500 block font-semibold">BP (mmHg)</span>
                <input
                  type="text"
                  value={bp}
                  onChange={(e) => setBp(e.target.value)}
                  className="w-full bg-transparent font-mono text-sm text-slate-900 font-bold outline-none"
                />
              </div>
              <div className="bg-slate-50 border border-slate-300 rounded-lg p-2.5">
                <span className="text-[10px] text-slate-500 block font-semibold">Pulse (BPM)</span>
                <input
                  type="text"
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value)}
                  className="w-full bg-transparent font-mono text-sm text-red-600 font-bold outline-none"
                />
              </div>
              <div className="bg-slate-50 border border-slate-300 rounded-lg p-2.5">
                <span className="text-[10px] text-slate-500 block font-semibold">SpO2 (%)</span>
                <input
                  type="text"
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  className="w-full bg-transparent font-mono text-sm text-blue-600 font-bold outline-none"
                />
              </div>
              <div className="bg-slate-50 border border-slate-300 rounded-lg p-2.5">
                <span className="text-[10px] text-slate-500 block font-semibold">Resp Rate (/min)</span>
                <input
                  type="text"
                  value={respRate}
                  onChange={(e) => setRespRate(e.target.value)}
                  className="w-full bg-transparent font-mono text-sm text-emerald-700 font-bold outline-none"
                />
              </div>
            </div>
          </div>

          {/* Regional Notes */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-700 uppercase tracking-wide">
                Regional Incident Notes
              </span>
              <span className="text-amber-700 font-mono text-[10px] font-semibold">Hindi / Marathi / English</span>
            </div>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white resize-none font-sans"
            />
          </div>

          {/* Injury Photo Capture */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
              Multimodal Vision Upload
            </span>
            {!imagePreview ? (
              <label className="border-2 border-dashed border-slate-300 rounded-lg p-3 flex items-center justify-center gap-2 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                <Camera className="w-4 h-4 text-emerald-600" />
                <span className="text-xs text-slate-700 font-semibold">Attach Trauma Photo</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            ) : (
              <div className="relative rounded-lg overflow-hidden border border-slate-200 h-24 bg-slate-100">
                <img src={imagePreview} alt="Injury" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-1 right-1 p-1 bg-slate-900/80 text-white rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Submit Trigger */}
          <button
            onClick={handleParamedicSubmit}
            disabled={loadingTriage}
            className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer"
          >
            {loadingTriage ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-amber-200" />
                <span>Running Gemini Multimodal Triage...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>🚀 ANALYZE &amp; ROUTE VIA GEMINI</span>
              </>
            )}
          </button>
        </section>

        {/* PANE 2: HOSPITAL ER COMMAND TOWER */}
        <section
          className={`flex flex-col bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3.5 overflow-y-auto max-h-[calc(100vh-105px)] ${
            mobileTab === "er" ? "block" : "hidden md:flex"
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  2. Hospital ER Command Tower
                </h2>
                <span className="text-[10px] font-mono text-emerald-700 font-semibold">
                  {currentHospital.name} • 94.2% Grade A+
                </span>
              </div>
            </div>
            <Link
              href="/hospital-er"
              target="_blank"
              className="text-[11px] text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium"
            >
              <span>Full Tab</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {/* Alert Banner & 15-Min Timer */}
          <div className="bg-red-600 text-white rounded-lg p-3 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">🚨</span>
              <div>
                <span className="text-xs font-black block">
                  INCOMING PATIENT — ETA {session.eta_minutes || 8} MINS
                </span>
                <span className="text-[10px] text-red-100 font-mono">
                  Trauma Score: {session.trauma_score} / 10 ({session.severity})
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] uppercase tracking-wider text-red-200 font-bold block">
                Soft-Lock
              </span>
              <span className="text-sm font-mono font-black text-white">
                {formatCountdown(countdownSeconds)}
              </span>
            </div>
          </div>

          {/* Gemini Structured SBAR Summary */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Gemini Clinical SBAR Handover (English)
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-red-50/50 p-2.5 rounded-lg border border-red-200">
                <span className="text-red-700 font-bold block mb-0.5">S - Situation</span>
                <p className="text-slate-800 line-clamp-2">{session.sbar?.situation}</p>
              </div>
              <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-200">
                <span className="text-blue-700 font-bold block mb-0.5">B - Background</span>
                <p className="text-slate-800 line-clamp-2">{session.sbar?.background}</p>
              </div>
              <div className="bg-amber-50/50 p-2.5 rounded-lg border border-amber-200">
                <span className="text-amber-700 font-bold block mb-0.5">A - Assessment</span>
                <p className="text-slate-800 line-clamp-2">{session.sbar?.assessment}</p>
              </div>
              <div className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-200">
                <span className="text-emerald-700 font-bold block mb-0.5">R - Recommendation</span>
                <p className="text-slate-800 line-clamp-2">{session.sbar?.recommendation}</p>
              </div>
            </div>
          </div>

          {/* Pre-Alert Checklists */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
              Pre-Arrival Rapid Checklists
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setONegFetched(!oNegFetched)}
                className={`p-2 rounded-lg border text-left flex items-center justify-between ${
                  oNegFetched ? "bg-red-50/70 border-red-300 font-bold text-slate-900" : "bg-slate-50 border-slate-200 opacity-60 text-slate-600"
                }`}
              >
                <span className="text-[11px]">🩸 O-Neg</span>
                <span className="text-xs">{oNegFetched ? "✓" : "○"}</span>
              </button>
              <button
                type="button"
                onClick={() => setCtReserved(!ctReserved)}
                className={`p-2 rounded-lg border text-left flex items-center justify-between ${
                  ctReserved ? "bg-blue-50/70 border-blue-300 font-bold text-slate-900" : "bg-slate-50 border-slate-200 opacity-60 text-slate-600"
                }`}
              >
                <span className="text-[11px]">☢️ CT Room</span>
                <span className="text-xs">{ctReserved ? "✓" : "○"}</span>
              </button>
              <button
                type="button"
                onClick={() => setSurgeonAlerted(!surgeonAlerted)}
                className={`p-2 rounded-lg border text-left flex items-center justify-between ${
                  surgeonAlerted ? "bg-emerald-50/70 border-emerald-300 font-bold text-slate-900" : "bg-slate-50 border-slate-200 opacity-60 text-slate-600"
                }`}
              >
                <span className="text-[11px]">👨‍⚕️ Surgeon</span>
                <span className="text-xs">{surgeonAlerted ? "✓" : "○"}</span>
              </button>
            </div>
          </div>

          {/* Bed Confirmation Actions */}
          <div className="pt-1">
            {!isBedLocked ? (
              <div className="flex gap-2">
                <button
                  onClick={() => acceptAndLockBed(session.session_id)}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>🔒 ACCEPT &amp; SOFT-LOCK ICU BED #2</span>
                </button>
                <button
                  onClick={() => declineAndReroute(session.session_id)}
                  className="px-3 py-2.5 bg-white hover:bg-slate-50 text-red-600 font-bold text-xs rounded-lg border border-slate-300 transition-colors cursor-pointer"
                >
                  Reroute
                </button>
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>ICU BED #2 CONFIRMED &amp; SOFT-LOCKED</span>
              </div>
            )}
          </div>
        </section>

        {/* PANE 3: FAMILY PRE-ADMISSION & LIVE NAGPUR MAP */}
        <section
          className={`flex flex-col bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3.5 overflow-y-auto max-h-[calc(100vh-105px)] ${
            mobileTab === "family" ? "block" : "hidden md:flex"
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  3. Family Portal &amp; Live OSRM Map
                </h2>
                <span className="text-[10px] font-mono text-blue-700 font-semibold">
                  Cashless Guarantee • Turn-by-Turn GPS
                </span>
              </div>
            </div>
            <Link
              href="/family-portal"
              target="_blank"
              className="text-[11px] text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium"
            >
              <span>Full Tab</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {/* Cashless Legal Guarantee */}
          <div className="bg-emerald-50/70 border border-emerald-200 p-2.5 rounded-lg flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="text-[11px]">
              <span className="font-bold text-slate-900 block">Supreme Court Care Guarantee (Art. 21)</span>
              <span className="text-slate-600">Zero-delay emergency trauma intake • ₹0 upfront deposit</span>
            </div>
          </div>

          {/* Interactive Live Nagpur OSRM Map */}
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-blue-600" />
                Live Nagpur Corridor Routing
              </span>
              <span className="font-mono text-emerald-700 font-bold">ETA ~ {session.eta_minutes || 8}m</span>
            </div>
            <NagpurMap height="240px" showSoftLockAction={false} />
          </div>

          {/* After-Care AI Bill Guard Status */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1 text-xs">
            <div className="flex items-center justify-between font-bold">
              <span className="text-slate-900 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                After-Care AI Bill Guard
              </span>
              <span className="text-emerald-700 font-mono text-[11px]">100% CGHS Compliant</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Audits ICU stay against PM-JAY and CGHS statutory caps. Prevents billing inflation before discharge.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

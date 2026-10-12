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
  AlertTriangle,
  Upload,
  X,
  FileText,
  CreditCard,
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
    useLiveGemini,
    setUseLiveGemini,
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
          bed_status: "SOFT_LOCKED",
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
    bed_status: "SOFT_LOCKED" as const,
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
    pre_reservations: { o_neg_blood: true, ct_scan: true, trauma_surgeon: true, neurosurgeon: false },
    timeline: [],
  };

  const isBedLocked = session.bed_status === "ACCEPTED_LOCKED";

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col font-sans">
      {/* Top Cockpit Header */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-4 py-2.5">
        <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-extrabold text-red-400 tracking-wider uppercase">
                  TRAUMANET LIVE 3-PANE COCKPIT
                </span>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                  BroadcastChannel Sync Active
                </span>
              </div>
              <h1 className="text-sm font-bold text-white flex items-center gap-2">
                Simultaneous Paramedic, ER Command, &amp; Family View • Nagpur Pilot Node #108
              </h1>
            </div>
          </div>

          {/* Quick Scenario Injectors & Reset */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium hidden lg:inline">Inject Live Case:</span>
            {DEMO_SCENARIOS.map((sc, i) => (
              <button
                key={i}
                onClick={() => injectEmergencyScenario(i)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold transition-colors flex items-center gap-1"
              >
                <Zap className="w-3 h-3 text-amber-400 fill-current" />
                <span>Case #{i + 1}</span>
              </button>
            ))}
            <button
              onClick={resetAllData}
              title="Reset data"
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile View Switcher */}
        <div className="grid grid-cols-3 gap-2 mt-2.5 pt-2 border-t border-slate-900 md:hidden text-xs">
          <button
            onClick={() => setMobileTab("paramedic")}
            className={`py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 ${
              mobileTab === "paramedic" ? "bg-red-600 text-white" : "bg-slate-900 text-slate-400"
            }`}
          >
            <Ambulance className="w-3.5 h-3.5" /> Paramedic
          </button>
          <button
            onClick={() => setMobileTab("er")}
            className={`py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 ${
              mobileTab === "er" ? "bg-emerald-600 text-white" : "bg-slate-900 text-slate-400"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> ER Command
          </button>
          <button
            onClick={() => setMobileTab("family")}
            className={`py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 ${
              mobileTab === "family" ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-400"
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
          className={`flex flex-col bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-xl space-y-3.5 overflow-y-auto max-h-[calc(100vh-110px)] ${
            mobileTab === "paramedic" ? "block" : "hidden md:flex"
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center shadow-sm">
                <Ambulance className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-white">
                  1. Paramedic Mobile Terminal
                </h2>
                <span className="text-[10px] font-mono text-red-400">Node #108 • Wardha Vector</span>
              </div>
            </div>
            <Link
              href="/paramedic"
              target="_blank"
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
            >
              <span>Full Tab</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {/* Manual Vitals Grid */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
              Manual Field Vitals
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">BP (mmHg)</span>
                <input
                  type="text"
                  value={bp}
                  onChange={(e) => setBp(e.target.value)}
                  className="w-full bg-transparent font-mono text-sm text-white font-bold outline-none"
                />
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">Pulse (BPM)</span>
                <input
                  type="text"
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value)}
                  className="w-full bg-transparent font-mono text-sm text-red-400 font-bold outline-none"
                />
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">SpO2 (%)</span>
                <input
                  type="text"
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  className="w-full bg-transparent font-mono text-sm text-blue-400 font-bold outline-none"
                />
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">Resp Rate (/min)</span>
                <input
                  type="text"
                  value={respRate}
                  onChange={(e) => setRespRate(e.target.value)}
                  className="w-full bg-transparent font-mono text-sm text-emerald-400 font-bold outline-none"
                />
              </div>
            </div>
          </div>

          {/* Regional Notes / Dictation */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-300 uppercase tracking-wide">
                Regional Incident Notes
              </span>
              <span className="text-amber-400 font-mono text-[10px]">Hindi / Hinglish / English</span>
            </div>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 resize-none font-sans"
            />
          </div>

          {/* Injury Photo Capture */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
              Multimodal Vision Upload
            </span>
            {!imagePreview ? (
              <label className="border border-dashed border-slate-800 rounded-xl p-3 flex items-center justify-center gap-2 bg-slate-950/60 cursor-pointer hover:border-slate-700 transition-colors">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-slate-300 font-semibold">Attach Trauma Photo</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-slate-800 h-28 bg-slate-950">
                <img src={imagePreview} alt="Injury" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-1.5 right-1.5 p-1 bg-black/70 text-white rounded-md"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Submit Trigger */}
          <button
            onClick={handleParamedicSubmit}
            disabled={loadingTriage}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {loadingTriage ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
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
          className={`flex flex-col bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-xl space-y-3.5 overflow-y-auto max-h-[calc(100vh-110px)] ${
            mobileTab === "er" ? "block" : "hidden md:flex"
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center shadow-sm">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-white">
                  2. Hospital ER Command Tower
                </h2>
                <span className="text-[10px] font-mono text-emerald-400">
                  {currentHospital.name} • 94.2% Grade A+
                </span>
              </div>
            </div>
            <Link
              href="/hospital-er"
              target="_blank"
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
            >
              <span>Full Tab</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {/* Alert Banner & 15-Min Timer */}
          <div className="bg-red-950/40 border border-red-500/50 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🚨</span>
              <div>
                <span className="text-xs font-extrabold text-white block">
                  INCOMING PATIENT — ETA {session.eta_minutes || 8} MINS
                </span>
                <span className="text-[10px] text-red-300 font-mono">
                  Trauma Score: {session.trauma_score} / 10 ({session.severity})
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">
                Soft-Lock
              </span>
              <span className="text-sm font-mono font-black text-amber-400">
                {formatCountdown(countdownSeconds)}
              </span>
            </div>
          </div>

          {/* Gemini Structured SBAR Summary */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Gemini Clinical SBAR Handover (English)
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-red-400 font-bold block mb-0.5">S - Situation</span>
                <p className="text-slate-300 line-clamp-2">{session.sbar?.situation}</p>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-blue-400 font-bold block mb-0.5">B - Background</span>
                <p className="text-slate-300 line-clamp-2">{session.sbar?.background}</p>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-amber-400 font-bold block mb-0.5">A - Assessment</span>
                <p className="text-slate-300 line-clamp-2">{session.sbar?.assessment}</p>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-emerald-400 font-bold block mb-0.5">R - Recommendation</span>
                <p className="text-slate-300 line-clamp-2">{session.sbar?.recommendation}</p>
              </div>
            </div>
          </div>

          {/* Pre-Alert Checklists */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
              Pre-Arrival Rapid Checklists
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setONegFetched(!oNegFetched)}
                className={`p-2 rounded-lg border text-left flex items-center justify-between ${
                  oNegFetched ? "bg-red-950/40 border-red-500/60" : "bg-slate-950 border-slate-800 opacity-60"
                }`}
              >
                <span className="text-[11px] font-bold text-white">🩸 O-Neg</span>
                <span className="text-xs">{oNegFetched ? "✓" : "○"}</span>
              </button>
              <button
                type="button"
                onClick={() => setCtReserved(!ctReserved)}
                className={`p-2 rounded-lg border text-left flex items-center justify-between ${
                  ctReserved ? "bg-blue-950/40 border-blue-500/60" : "bg-slate-950 border-slate-800 opacity-60"
                }`}
              >
                <span className="text-[11px] font-bold text-white">☢️ CT Room</span>
                <span className="text-xs">{ctReserved ? "✓" : "○"}</span>
              </button>
              <button
                type="button"
                onClick={() => setSurgeonAlerted(!surgeonAlerted)}
                className={`p-2 rounded-lg border text-left flex items-center justify-between ${
                  surgeonAlerted ? "bg-emerald-950/40 border-emerald-500/60" : "bg-slate-950 border-slate-800 opacity-60"
                }`}
              >
                <span className="text-[11px] font-bold text-white">👨‍⚕️ Surgeon</span>
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
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>🔒 ACCEPT &amp; SOFT-LOCK ICU BED #2</span>
                </button>
                <button
                  onClick={() => declineAndReroute(session.session_id)}
                  className="px-3 py-3 bg-slate-800 hover:bg-red-950 text-red-300 font-bold text-xs rounded-xl border border-slate-700 transition-colors"
                >
                  Reroute
                </button>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-extrabold text-xs flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>ICU BED #2 CONFIRMED &amp; SOFT-LOCKED</span>
              </div>
            )}
          </div>
        </section>

        {/* PANE 3: FAMILY PRE-ADMISSION & LIVE NAGPUR MAP */}
        <section
          className={`flex flex-col bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-xl space-y-3.5 overflow-y-auto max-h-[calc(100vh-110px)] ${
            mobileTab === "family" ? "block" : "hidden md:flex"
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-white">
                  3. Family Portal &amp; Live OSRM Map
                </h2>
                <span className="text-[10px] font-mono text-blue-400">
                  Cashless Guarantee • Turn-by-Turn GPS
                </span>
              </div>
            </div>
            <Link
              href="/family-portal"
              target="_blank"
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
            >
              <span>Full Tab</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {/* Cashless Legal Guarantee */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-[11px]">
              <span className="font-bold text-white block">Supreme Court Care Guarantee (Art. 21)</span>
              <span className="text-slate-400">Zero-delay emergency trauma intake • ₹0 upfront deposit</span>
            </div>
          </div>

          {/* Interactive Live Nagpur OSRM Map */}
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-blue-400" />
                Live Nagpur Corridor Routing
              </span>
              <span className="font-mono text-emerald-400 font-bold">ETA ~ {session.eta_minutes || 8}m</span>
            </div>
            <NagpurMap height="240px" showSoftLockAction={false} />
          </div>

          {/* After-Care AI Bill Guard Status */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
            <div className="flex items-center justify-between font-bold">
              <span className="text-white flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                After-Care AI Bill Guard
              </span>
              <span className="text-emerald-400 font-mono">100% CGHS Compliant</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Audits ICU stay against PM-JAY and CGHS statutory caps. Prevents billing inflation before discharge.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

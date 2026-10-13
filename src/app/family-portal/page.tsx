"use client";

import React, { useState } from "react";
import { useTraumaNet } from "@/lib/TraumaNetContext";
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Building2,
  Phone,
  MapPin,
  Ambulance,
  Check,
  Upload,
  CreditCard,
  FileText,
  AlertCircle,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export default function FamilyPortalPage() {
  const { activeSession, activeHospital, updateSession } = useTraumaNet();

  // Document upload & manual entry state
  const [docType, setDocType] = useState<"ABHA" | "INSURANCE" | "AADHAAR">("ABHA");
  const [docNumber, setDocNumber] = useState("");
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(
    Boolean(activeSession?.patient_info?.abha_id || activeSession?.patient_info?.policy_number)
  );
  const [verifiedProvider, setVerifiedProvider] = useState(
    activeSession?.patient_info?.insurance_provider || "Ayushman Bharat (ABHA)"
  );
  const [showDocModal, setShowDocModal] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);

  // Fallback graceful values if session is initializing
  const patientName = activeSession?.patient_info?.name || "Rahul Sanjay Sharma";
  const patientAge = activeSession?.patient_info?.age || 32;
  const patientGender = activeSession?.patient_info?.gender || "MALE";
  const ambulanceId = activeSession?.ambulance_id || "MH-31-TR-0108";
  const etaMinutes = activeSession?.eta_minutes ?? 7;
  const speedKmh = activeSession?.speed_kmh ?? 62;
  const isHospitalAccepted = activeSession?.bed_status === "ACCEPTED_LOCKED" || activeSession?.bed_status === "SOFT_LOCKED" || true;
  
  const hospitalName = activeHospital?.name || "AIIMS Nagpur (MIHAN Trauma Center)";
  const hospitalAddress = activeHospital?.address || "Plot No. 2, Sector 20, MIHAN, Nagpur 441108";
  const hospitalPhone = activeHospital?.emergency_contact || "+91 712 281 7000";

  const handleDocumentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docNumber && !uploadedFile) return;

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      setShowDocModal(false);

      if (activeSession) {
        if (docType === "ABHA") {
          setVerifiedProvider("Ayushman Bharat PM-JAY (ABHA)");
          updateSession(activeSession.session_id, {
            patient_info: {
              ...activeSession.patient_info,
              abha_id: docNumber || "14-9921-5502-3819",
              insurance_provider: "Ayushman Bharat PM-JAY",
            },
          });
        } else if (docType === "INSURANCE") {
          setVerifiedProvider("Private Cashless Mediclaim");
          updateSession(activeSession.session_id, {
            patient_info: {
              ...activeSession.patient_info,
              policy_number: docNumber || "POL-CARE-882194-MH",
              insurance_provider: "Star Health / TPA Cashless",
            },
          });
        } else {
          setVerifiedProvider("National Identity (Aadhaar Verified)");
          updateSession(activeSession.session_id, {
            patient_info: {
              ...activeSession.patient_info,
              policy_number: docNumber || "XXXXXXXX4920",
            },
          });
        }
      }
    }, 900);
  };

  const handleSimulateQuickScan = (type: "ABHA" | "INSURANCE") => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      if (type === "ABHA") {
        setDocNumber("14-8849-2041-9923");
        setVerifiedProvider("Ayushman Bharat PM-JAY (ABHA)");
        if (activeSession) {
          updateSession(activeSession.session_id, {
            patient_info: {
              ...activeSession.patient_info,
              abha_id: "14-8849-2041-9923",
              insurance_provider: "Ayushman Bharat PM-JAY",
            },
          });
        }
      } else {
        setDocNumber("SH-NAG-2024-8890");
        setVerifiedProvider("Star Health Premier Care (Cashless)");
        if (activeSession) {
          updateSession(activeSession.session_id, {
            patient_info: {
              ...activeSession.patient_info,
              policy_number: "SH-NAG-2024-8890",
              insurance_provider: "Star Health Premier Care",
            },
          });
        }
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#E6EDF4] text-slate-900 font-sans pb-24">
      {/* Calm Institutional Header */}
      <div className="bg-[#162E4A] text-white border-b border-[#203F64] shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
              <Ambulance className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight">TraumaNet Family Care</span>
                <span className="text-[11px] bg-white/15 px-2 py-0.5 rounded text-slate-200 font-mono">
                  Live Emergency Tracking
                </span>
              </div>
              <p className="text-xs text-slate-300">
                108 Emergency Medical Services • Nagpur Metropolitan Network
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <a
              href="tel:108"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors shadow-2xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Emergency Helpdesk: 108</span>
            </a>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* 1. PATIENT IN TRANSIT HERO CARD */}
        <div className="bg-white rounded-2xl border border-slate-300 shadow-xs overflow-hidden">
          {/* Top Status Bar with PATIENT IN TRANSIT badge */}
          <div className="bg-blue-50/90 border-b border-blue-200 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600" />
              </span>
              <span className="text-xs font-black tracking-wider uppercase text-blue-900 font-mono">
                PATIENT IN TRANSIT
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-xs font-semibold text-slate-700">
                Under Active Care of Ambulance Paramedics
              </span>
            </div>

            <div className="text-xs font-mono font-bold text-blue-900 bg-white px-2.5 py-1 rounded-md border border-blue-200 shadow-2xs">
              Live Ambulance GPS Active
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            {/* Patient Header & ETA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Patient
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                  {patientName}
                </h1>
                <p className="text-xs text-slate-600 mt-1">
                  {patientAge} Years • {patientGender === "MALE" ? "Male" : patientGender === "FEMALE" ? "Female" : "Other"} • Accompanied by Emergency Medical Technicians
                </p>
              </div>

              {/* Big Calm ETA Block */}
              <div className="bg-[#162E4A] text-white p-4 rounded-xl flex items-center gap-4 sm:min-w-[220px] justify-between shadow-xs">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-300 block">
                    Estimated Arrival (ETA)
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-3xl font-black font-mono text-white tracking-tight">
                      ~{etaMinutes}
                    </span>
                    <span className="text-sm font-semibold text-slate-300 font-mono">
                      MINS
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-300 block mt-0.5">
                    Direct entry to trauma bay
                  </span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-blue-300" />
                </div>
              </div>
            </div>

            {/* Two-Column Grid: Ambulance Status & Hospital Accepted Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ambulance Status */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Ambulance className="w-4 h-4 text-blue-700" />
                    Ambulance Status
                  </span>
                  <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
                    EN ROUTE
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ambulance Vehicle:</span>
                    <span className="font-mono font-bold text-slate-900">{ambulanceId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Transit Speed:</span>
                    <span className="font-mono font-semibold text-slate-900">{speedKmh} km/h (Priority Corridor)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Paramedic Care:</span>
                    <span className="font-semibold text-emerald-700">Stabilized &amp; Monitored</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-200 leading-relaxed">
                  The ambulance is navigating via green emergency corridor with sirens active to ensure shortest transit time.
                </p>
              </div>

              {/* Hospital Accepted Status & Selected Hospital */}
              <div className="bg-emerald-50/70 rounded-xl p-4 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-700" />
                    Hospital Accepted Status
                  </span>
                  <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-700" />
                    BED RESERVED
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {hospitalName}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <span>{hospitalAddress}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-emerald-200 flex items-center justify-between text-xs">
                  <span className="text-emerald-900 font-semibold text-[11px]">
                    ✓ 15-Minute Guaranteed Hold Active
                  </span>
                  <a
                    href={`tel:${hospitalPhone}`}
                    className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 font-mono text-xs"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call ER Desk</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. STATUTORY GUARANTEE: NO PAYMENTS REQUIRED */}
        <div className="bg-amber-50 rounded-2xl border border-amber-300 p-5 shadow-xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0 text-amber-800">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 text-xs text-amber-950">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-amber-950 tracking-tight">
                No Payment Required for Emergency Care or Stabilization
              </h3>
              <span className="text-[10px] font-mono font-bold bg-amber-200/80 px-2 py-0.5 rounded text-amber-900">
                SUPREME COURT DIRECTIVE
              </span>
            </div>
            <p className="text-slate-700 leading-relaxed font-sans">
              Under Indian law and the Supreme Court&apos;s landmark emergency care mandate (Pt. Parmanand Katara ruling), hospitals must provide <strong>immediate life-saving resuscitation and emergency treatment without demanding any advance deposit, registration fee, or billing clearance</strong>.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1 font-medium text-slate-700 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-800 font-bold">
                ✓ ₹0 Upfront Deposit
              </span>
              <span className="flex items-center gap-1 text-slate-600">
                • Paperwork is completed after patient is stable
              </span>
              <span className="flex items-center gap-1 text-slate-600">
                • Emergency beds cannot be denied
              </span>
            </div>
          </div>
        </div>

        {/* 3. CALM STEP-BY-STEP TRANSIT TIMELINE */}
        <div className="bg-white rounded-2xl border border-slate-300 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-700" />
                Transit &amp; Hospital Admission Progress
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Step-by-step progress from dispatch to emergency department intake
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
              Updated Live
            </span>
          </div>

          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {/* Timeline Item 1 */}
            <div className="relative">
              <span className="absolute -left-6 sm:-left-8 top-0.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                ✓
              </span>
              <div>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-xs font-bold text-slate-900">
                    Emergency Call Logged &amp; Ambulance Dispatched
                  </h4>
                  <span className="text-[11px] font-mono text-slate-500">108 Fleet Control</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  The nearest Advanced Life Support ambulance unit was assigned and navigated to the location immediately.
                </p>
              </div>
            </div>

            {/* Timeline Item 2 */}
            <div className="relative">
              <span className="absolute -left-6 sm:-left-8 top-0.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                ✓
              </span>
              <div>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-xs font-bold text-slate-900">
                    Patient Onboard &amp; Medical Stabilization Initiated
                  </h4>
                  <span className="text-[11px] font-mono text-slate-500">Wardha Road</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Emergency Medical Technicians secured vital parameters, administered continuous oxygen support, and maintained spinal precautions.
                </p>
              </div>
            </div>

            {/* Timeline Item 3 */}
            <div className="relative">
              <span className="absolute -left-6 sm:-left-8 top-0.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                ✓
              </span>
              <div>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-xs font-bold text-slate-900">
                    Hospital Notified &amp; Clinical Pre-Alert Sent
                  </h4>
                  <span className="text-[11px] font-mono text-slate-500">Direct Handover</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Emergency department doctors received real-time vitals and injury details ahead of time so the trauma bay could be pre-configured.
                </p>
              </div>
            </div>

            {/* Timeline Item 4 */}
            <div className="relative">
              <span className="absolute -left-6 sm:-left-8 top-0.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                ✓
              </span>
              <div>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-xs font-bold text-slate-900">
                    {hospitalName} Accepted &amp; Bed Soft-Locked
                  </h4>
                  <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Bed #2 Confirmed
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Trauma team accepted the transfer. A dedicated emergency bed, blood bank reserves, and CT scan team are reserved exclusively for the patient.
                </p>
              </div>
            </div>

            {/* Timeline Item 5 - Current active step */}
            <div className="relative">
              <span className="absolute -left-6 sm:-left-8 top-0.5 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold animate-pulse">
                ●
              </span>
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200">
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                    <span>Patient in Transit to Emergency Department</span>
                    <span className="text-[10px] font-mono font-normal text-blue-700 bg-white px-1.5 py-0.5 rounded border border-blue-200">
                      CURRENT STAGE
                    </span>
                  </h4>
                  <span className="text-xs font-bold font-mono text-blue-900">~{etaMinutes} mins remaining</span>
                </div>
                <p className="text-xs text-slate-700 mt-1">
                  Ambulance is maintaining steady progress along Wardha Road corridor. Trauma bay staff is in position at the hospital ambulance bay entrance.
                </p>
              </div>
            </div>

            {/* Timeline Item 6 - Upcoming */}
            <div className="relative opacity-60">
              <span className="absolute -left-6 sm:-left-8 top-0.5 w-5 h-5 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                6
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-700">
                  Arrival &amp; Direct Emergency Bay Intake
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct transfer from stretcher into resuscitation bay with zero reception or registration desk waiting.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. INSURANCE & DOCUMENTS ACTION (CALM & OPTIONAL) */}
        <div className="bg-white rounded-2xl border border-slate-300 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-700" />
                Insurance &amp; National Health ID (Optional Pre-Check)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Share details to streamline cashless admission formalities after patient stabilization
              </p>
            </div>

            {isVerified && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cashless Pre-Auth Active</span>
              </span>
            )}
          </div>

          {isVerified ? (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {verifiedProvider}
                  </h4>
                  <p className="text-xs text-emerald-900 font-mono mt-0.5">
                    ID / Policy Ref: {docNumber || activeSession?.patient_info?.abha_id || activeSession?.patient_info?.policy_number || "14-8849-2041-9923"}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Pre-authorization details transmitted to {hospitalName} billing coordination desk.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsVerified(false);
                  setShowDocModal(true);
                }}
                className="text-xs text-slate-700 hover:text-slate-900 underline font-medium cursor-pointer shrink-0"
              >
                Change Document
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Emergency care is provided immediately regardless of whether insurance is linked right now. If you have an <strong>Ayushman Bharat (ABHA) Health Card</strong>, <strong>Private Mediclaim Policy</strong>, or <strong>Aadhaar Card</strong>, you can link it here to expedite cashless paperwork:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option 1: Quick ABHA linking */}
                <button
                  onClick={() => handleSimulateQuickScan("ABHA")}
                  disabled={isVerifying}
                  className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-left transition-colors flex items-center gap-3 cursor-pointer shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-lg bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-700 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Link Ayushman Bharat (ABHA)</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">Auto-checks national PM-JAY registry</p>
                  </div>
                </button>

                {/* Option 2: Quick Private Insurance */}
                <button
                  onClick={() => handleSimulateQuickScan("INSURANCE")}
                  disabled={isVerifying}
                  className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-left transition-colors flex items-center gap-3 cursor-pointer shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Link Star Health / TPA Policy</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">Pre-approves cashless admission</p>
                  </div>
                </button>
              </div>

              {/* Manual input or photo upload trigger */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-slate-500">
                  Prefer to enter policy number manually or upload a photo?
                </span>
                <button
                  onClick={() => setShowDocModal(true)}
                  className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>Manual Entry / Upload File</span>
                </button>
              </div>

              {isVerifying && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-blue-700 border-t-transparent animate-spin shrink-0" />
                  <span>Verifying healthcare record with hospital admission gateway...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 5. HELPFUL QUESTIONS & CONTACT FOR FAMILIES */}
        <div className="bg-white rounded-2xl border border-slate-300 p-5 shadow-xs space-y-3">
          <button
            onClick={() => setFaqOpen(!faqOpen)}
            className="w-full flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <HelpCircle className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-900">
                Frequently Asked Questions for Family Members
              </span>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {faqOpen ? "▲ Hide" : "▼ Show"}
            </span>
          </button>

          {faqOpen && (
            <div className="pt-3 border-t border-slate-200 space-y-3 text-xs text-slate-700 leading-relaxed font-sans">
              <div>
                <strong className="text-slate-900 block font-semibold">Where should we go when we reach the hospital?</strong>
                <p className="text-slate-600 mt-0.5">
                  Go directly to the <strong>Emergency Department / Trauma Bay entrance</strong> of {hospitalName}. Mention the patient&apos;s name &quot;{patientName}&quot; and 108 Ambulance Unit #{ambulanceId}. A patient coordinator will guide you immediately.
                </p>
              </div>
              <div>
                <strong className="text-slate-900 block font-semibold">Do we need to bring money or cash right now?</strong>
                <p className="text-slate-600 mt-0.5">
                  No. Emergency stabilization is mandated by law to begin immediately without any payment. Billing, insurance claims, and government scheme processing happen peacefully after the patient is out of immediate danger.
                </p>
              </div>
              <div>
                <strong className="text-slate-900 block font-semibold">Can we speak to the paramedic in the ambulance?</strong>
                <p className="text-slate-600 mt-0.5">
                  The paramedics are actively providing one-on-one medical care to the patient. For urgent coordination, please contact the 108 Emergency Control Room at <strong>108</strong>.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Manual Entry / Document Upload Modal */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                Link Health Insurance or Identity
              </h3>
              <button
                onClick={() => setShowDocModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold leading-none p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDocumentSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Document Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["ABHA", "INSURANCE", "AADHAAR"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setDocType(t)}
                      className={`py-2 px-2.5 rounded-lg font-semibold border transition-all text-center ${
                        docType === t
                          ? "bg-[#162E4A] text-white border-[#162E4A]"
                          : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      {t === "ABHA" ? "ABHA ID" : t === "INSURANCE" ? "Mediclaim" : "Aadhaar"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  {docType === "ABHA" ? "14-Digit ABHA Health ID" : docType === "INSURANCE" ? "Policy / TPA Card Number" : "Aadhaar Number"}
                </label>
                <input
                  type="text"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  placeholder={docType === "ABHA" ? "e.g. 14-8849-2041-9923" : "e.g. SH-NAG-2024-8890"}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Or Upload Card Photo / PDF
                </label>
                <label className="flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer text-slate-600 transition-colors">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">
                    {uploadedFile ? `Attached: ${uploadedFile}` : "Select image or document file"}
                  </span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadedFile(e.target.files[0].name);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  {isVerifying ? "Verifying..." : "Save & Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useTraumaNet } from "@/lib/TraumaNetContext";
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Clock,
  ArrowRight,
  Sparkles,
  Upload,
  AlertTriangle,
  Scale,
  DollarSign,
  FileSpreadsheet,
  Check,
  Building2,
} from "lucide-react";
import DocumentAIScanner from "@/components/DocumentAIScanner";
import Link from "next/link";
import { BillGuardReport } from "@/lib/types";

export default function FamilyPortalPage() {
  const { activeSession, activeHospital, updateSession } = useTraumaNet();

  const [activeTab, setActiveTab] = useState<"status" | "billguard">("status");
  const [billImage, setBillImage] = useState<File | null>(null);
  const [billPreview, setBillPreview] = useState<string | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [billAuditReport, setBillAuditReport] = useState<BillGuardReport | null>(null);

  // If no active session yet
  if (!activeSession) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-slate-100 p-4 md:p-8 flex items-center justify-center relative overflow-hidden font-sans">
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 backdrop-blur-md bg-slate-900/80 border border-slate-800 shadow-2xl rounded-3xl p-8 max-w-lg text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto">
            <Users className="w-8 h-8 text-[#3B82F6]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Family Pre-Registration &amp; Bill Guard</h2>
            <p className="text-xs text-slate-400 mt-1">Zero-Gate Admission &amp; Supreme Court Parmanand Katara Protection</p>
          </div>
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2 text-left">
            <p className="flex items-center gap-2 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> Cashless Pre-Admission Protocol Enabled
            </p>
            <p className="text-slate-400">
              Standing by for inbound paramedic session. Once transmitted, the live timeline and hospital bed guarantee will appear here.
            </p>
          </div>
          <Link
            href="/paramedic"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-colors"
          >
            Go to Paramedic Intake App
          </Link>
        </div>
      </div>
    );
  }

  const handleDocScanComplete = (details: any) => {
    updateSession(activeSession.session_id, {
      patient_info: {
        ...activeSession.patient_info,
        insurance_provider: details.provider,
        policy_number: details.idNumber,
        coverage_amount_inr: details.coverageInr,
      },
    });
  };

  const handleBillUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBillImage(file);
      setBillPreview(URL.createObjectURL(file));
    }
  };

  const handleRunBillGuardAudit = async () => {
    setIsAuditing(true);
    try {
      const formData = new FormData();
      if (billImage) formData.append("bill", billImage);
      formData.append("notes", "Interim emergency trauma invoice");

      const res = await fetch("/api/bill-guard", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        setBillAuditReport(json.data);
      }
    } catch {
      alert("Failed to audit bill with AI Bill Guard.");
    } finally {
      setIsAuditing(false);
    }
  };

  const isBedLocked = activeSession.bed_status === "ACCEPTED_LOCKED";

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 p-4 md:p-8 max-w-5xl mx-auto font-sans pb-28 relative overflow-hidden">
      {/* Radial glows */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-96 right-10 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-5 mb-6 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Family Pre-Registration &amp; Bill Guard</h1>
            <p className="text-xs text-slate-400">
              Patient: <strong className="text-white">{activeSession.patient_info?.name}</strong> • Node #108 Inbound
            </p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab("status")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "status" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            1. Status &amp; ABHA ID
          </button>
          <button
            onClick={() => setActiveTab("billguard")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "billguard" ? "bg-red-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
            <span>2. After-Care AI Bill Guard</span>
          </button>
        </div>
      </div>

      <div className="relative z-10 space-y-6">
        {/* Mandatory Legal Compliance Banner (Parmanand Katara Ruling) */}
        <div className="backdrop-blur-md bg-amber-950/30 border border-amber-500/40 rounded-2xl p-4.5 sm:p-5 flex items-start gap-3.5 shadow-xl">
          <Scale className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <div className="text-amber-300 font-extrabold uppercase tracking-wide flex items-center gap-2">
              <span>⚖️ Supreme Court Care Guarantee (Parmanand Katara Mandate)</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              &quot;Emergency care cannot be withheld for billing counter formalities. All deposits and upfront financial charges are strictly <strong className="text-amber-300">DEFERRED</strong> until after immediate stabilization and life-saving resuscitation.&quot;
            </p>
          </div>
        </div>

        {activeTab === "status" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Live Patient Timeline Card */}
            <div className="backdrop-blur-md bg-slate-900/80 border border-slate-800 shadow-2xl rounded-2xl p-5 md:p-6 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#3B82F6]" /> Emergency Transit &amp; Admission Timeline
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Stage 1: In Transit */}
                <div className="bg-slate-950 p-4 rounded-xl border border-blue-500/40 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-blue-400">
                    <span>STAGE 1</span>
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                  </div>
                  <h3 className="text-sm font-extrabold text-white">In Transit (Node #108)</h3>
                  <p className="text-xs text-slate-400">ETA ~ {activeSession.eta_minutes} mins to {activeHospital?.name || "AIIMS Nagpur"}</p>
                </div>

                {/* Stage 2: ICU Bed Soft-Locked */}
                <div className={`p-4 rounded-xl border space-y-1 transition-all ${
                  isBedLocked ? "bg-emerald-950/40 border-emerald-500/50" : "bg-slate-950 border-slate-800"
                }`}>
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                    <span>STAGE 2</span>
                    {isBedLocked && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <h3 className="text-sm font-extrabold text-white">
                    {isBedLocked ? "ICU Bed #2 Soft-Locked" : "Bed Soft-Lock Pending"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isBedLocked ? "15-min flight-booking hold active" : "Hospital reviewing inbound vitals"}
                  </p>
                </div>

                {/* Stage 3: ER Prepared */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-xs font-bold text-slate-500">STAGE 3</div>
                  <h3 className="text-sm font-extrabold text-white">ER Trauma Bay Prepared</h3>
                  <p className="text-xs text-slate-400">Blood Bank &amp; Pan-Scan CT on standby</p>
                </div>
              </div>
            </div>

            {/* Paperless Pre-Registration: ABHA / Insurance Card Scan */}
            <DocumentAIScanner
              onScanComplete={handleDocScanComplete}
              currentDepositInr={activeSession.deposit_amount_inr}
            />
          </div>
        )}

        {/* After-Care AI Bill Guard Tab */}
        {activeTab === "billguard" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="backdrop-blur-md bg-slate-900/80 border border-slate-800 shadow-2xl rounded-2xl p-5 md:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800/80 pb-3 gap-2">
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-red-500" /> After-Care AI Bill Guard &amp; CGHS Audit
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Cross-checks interim hospital invoices against PM-JAY Packages and CGHS Price Ceilings
                  </p>
                </div>
                <span className="text-xs bg-red-950/60 text-red-300 border border-red-800/50 px-3 py-1 rounded-full font-bold">
                  Forensic Anti-Overcharge Engine
                </span>
              </div>

              {/* Upload Interim Bill */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-slate-800 rounded-2xl p-6 text-center bg-slate-950/60 hover:border-slate-700 transition-colors">
                  <FileSpreadsheet className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-200 mb-1">
                    Upload Hospital Interim Invoice / Estimation Slip
                  </p>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Supports camera photos of physical billing counters &amp; PDFs
                  </p>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer border border-slate-700 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-blue-400" />
                    <span>Choose Invoice File</span>
                    <input type="file" accept="image/*,.pdf" onChange={handleBillUpload} className="hidden" />
                  </label>
                  {billImage && (
                    <div className="text-xs text-emerald-400 font-semibold mt-2">
                      ✓ Attached: {billImage.name}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3 text-xs">
                  <h4 className="font-bold text-slate-300">CGHS Statutory Benchmark Rules Active:</h4>
                  <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
                    <li>ICU Bed Care per Day: <strong className="text-white">Cap ₹4,500/day</strong></li>
                    <li>Whole Body Polytrauma Pan-Scan: <strong className="text-white">Cap ₹3,500</strong></li>
                    <li>Blood Bank Crossmatch &amp; PRBC: <strong className="text-white">Cap ₹1,500/unit</strong></li>
                    <li>Emergency Intubation / Airway: <strong className="text-white">Cap ₹1,200</strong></li>
                  </ul>
                  <button
                    onClick={handleRunBillGuardAudit}
                    disabled={isAuditing}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isAuditing ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                        <span>Auditing Invoice against CGHS Price Caps...</span>
                      </>
                    ) : (
                      <>
                        <Scale className="w-4 h-4" />
                        <span>RUN FORENSIC BILL GUARD AUDIT</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Bill Guard Forensic Audit Report */}
              {billAuditReport && (
                <div className="mt-6 p-5 bg-slate-950 rounded-2xl border border-red-500/40 space-y-5 animate-in fade-in duration-300 shadow-2xl">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
                    <div>
                      <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        Forensic Audit Flagged ₹{billAuditReport.total_overcharge_inr.toLocaleString()} in Illegal Overcharging
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">{billAuditReport.hospital_name}</p>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">Billed: <del className="text-red-400 font-mono font-bold">₹{billAuditReport.total_billed_inr.toLocaleString()}</del></span>
                      <span className="text-emerald-400 font-mono font-extrabold bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/40">
                        Statutory Cap: ₹{billAuditReport.cghs_capped_total_inr.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Line Items Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-800">
                          <th className="pb-2">Invoice Line Item</th>
                          <th className="pb-2">Billed Amount</th>
                          <th className="pb-2">CGHS Cap</th>
                          <th className="pb-2 text-red-400">Overcharge Flag</th>
                          <th className="pb-2">Statutory Reference</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-sans">
                        {billAuditReport.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                            <td className="py-2.5 text-white font-medium">{item.item_name}</td>
                            <td className="py-2.5 font-mono text-slate-300">₹{item.billed_amount_inr.toLocaleString()}</td>
                            <td className="py-2.5 font-mono text-emerald-400">₹{item.cghs_cap_inr.toLocaleString()}</td>
                            <td className="py-2.5 font-mono font-bold text-red-400">
                              +₹{item.excess_amount_inr.toLocaleString()}
                            </td>
                            <td className="py-2.5 text-[11px] text-slate-400 font-mono">{item.package_reference}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Legal Notice */}
                  <div className="p-3 bg-red-950/30 rounded-xl border border-red-500/20 text-xs text-red-300 flex items-start gap-2">
                    <Scale className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                    <span>{billAuditReport.legal_notice}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

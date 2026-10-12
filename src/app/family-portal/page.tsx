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
  FileSpreadsheet,
  Check,
  ArrowLeft,
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
      <div className="min-h-screen bg-[#E6EDF4] text-slate-900 p-4 md:p-8 flex items-center justify-center font-sans">
        <div className="bg-white border border-slate-200 shadow-md rounded-2xl p-8 max-w-lg text-center space-y-5">
          <div className="w-14 h-14 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-600">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Family Pre-Registration &amp; Bill Guard</h2>
            <p className="text-xs text-slate-500 mt-1">Zero-Gate Admission &amp; Supreme Court Parmanand Katara Protection</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2 text-left">
            <p className="flex items-center gap-2 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> Cashless Pre-Admission Protocol Enabled
            </p>
            <p className="text-slate-500">
              Standing by for inbound paramedic session. Once transmitted, the live timeline and hospital bed guarantee will appear here.
            </p>
          </div>
          <Link
            href="/paramedic"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
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
    <div className="min-h-screen bg-[#E6EDF4] text-slate-900 p-4 md:p-8 max-w-5xl mx-auto font-sans pb-24">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-5 mb-6 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">Family Pre-Registration &amp; Bill Guard</h1>
            <p className="text-xs text-slate-500">
              Patient: <strong className="text-slate-900">{activeSession.patient_info?.name}</strong> • Node #108 Inbound
            </p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab("status")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "status" ? "bg-white text-slate-900 shadow-xs border border-slate-200" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            1. Transit &amp; ABHA
          </button>
          <button
            onClick={() => setActiveTab("billguard")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "billguard" ? "bg-red-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>2. After-Care AI Bill Guard</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Supreme Court Parmanand Katara Mandate */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
          <Scale className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <div className="text-amber-900 font-bold uppercase tracking-wide flex items-center gap-2">
              <span>⚖️ Supreme Court Care Guarantee (Parmanand Katara Mandate)</span>
            </div>
            <p className="text-amber-800 leading-relaxed font-sans">
              &quot;Emergency care cannot be withheld for billing counter formalities. All deposits and upfront financial charges are strictly <strong className="text-amber-950 font-bold">DEFERRED</strong> until after immediate stabilization and life-saving resuscitation.&quot;
            </p>
          </div>
        </div>

        {activeTab === "status" && (
          <div className="space-y-6">
            {/* Live Patient Timeline Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 space-y-4 shadow-xs">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" /> Emergency Transit &amp; Admission Timeline
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Stage 1: In Transit */}
                <div className="bg-blue-50/60 p-4 rounded-lg border border-blue-200 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-blue-700">
                    <span>STAGE 1</span>
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">In Transit (Node #108)</h3>
                  <p className="text-xs text-slate-600">ETA ~ {activeSession.eta_minutes} mins to {activeHospital?.name || "AIIMS Nagpur"}</p>
                </div>

                {/* Stage 2: ICU Bed Soft-Locked */}
                <div className={`p-4 rounded-lg border space-y-1 transition-all ${
                  isBedLocked ? "bg-emerald-50/70 border-emerald-300" : "bg-slate-50 border-slate-200"
                }`}>
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-700">
                    <span>STAGE 2</span>
                    {isBedLocked && <Check className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {isBedLocked ? "ICU Bed #2 Soft-Locked" : "Bed Soft-Lock Pending"}
                  </h3>
                  <p className="text-xs text-slate-600">
                    {isBedLocked ? "15-min flight-booking hold active" : "Hospital reviewing inbound vitals"}
                  </p>
                </div>

                {/* Stage 3: ER Prepared */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1">
                  <div className="text-xs font-bold text-slate-500">STAGE 3</div>
                  <h3 className="text-sm font-bold text-slate-900">ER Trauma Bay Prepared</h3>
                  <p className="text-xs text-slate-600">Blood Bank &amp; Pan-Scan CT on standby</p>
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
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
                <div>
                  <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-red-600" /> After-Care AI Bill Guard &amp; CGHS Audit
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Cross-checks interim hospital invoices against PM-JAY Packages and CGHS Price Ceilings
                  </p>
                </div>
                <span className="text-xs bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full font-bold">
                  Forensic Anti-Overcharge Engine
                </span>
              </div>

              {/* Upload Interim Bill */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                  <FileSpreadsheet className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700 mb-1">
                    Upload Hospital Interim Invoice / Estimation Slip
                  </p>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Supports camera photos of physical billing counters &amp; PDFs
                  </p>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer border border-slate-300 transition-colors shadow-xs">
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>Choose Invoice File</span>
                    <input type="file" accept="image/*,.pdf" onChange={handleBillUpload} className="hidden" />
                  </label>
                  {billImage && (
                    <div className="text-xs text-emerald-700 font-semibold mt-2">
                      ✓ Attached: {billImage.name}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                  <h4 className="font-bold text-slate-800">CGHS Statutory Benchmark Rules Active:</h4>
                  <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                    <li>ICU Bed Care per Day: <strong className="text-slate-900">Cap ₹4,500/day</strong></li>
                    <li>Whole Body Polytrauma Pan-Scan: <strong className="text-slate-900">Cap ₹3,500</strong></li>
                    <li>Blood Bank Crossmatch &amp; PRBC: <strong className="text-slate-900">Cap ₹1,500/unit</strong></li>
                    <li>Emergency Intubation / Airway: <strong className="text-slate-900">Cap ₹1,200</strong></li>
                  </ul>
                  <button
                    onClick={handleRunBillGuardAudit}
                    disabled={isAuditing}
                    className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isAuditing ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin text-amber-200" />
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
                <div className="mt-6 p-5 bg-white rounded-xl border border-red-200 space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        Forensic Audit Flagged ₹{billAuditReport.total_overcharge_inr.toLocaleString()} in Illegal Overcharging
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">{billAuditReport.hospital_name}</p>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500">Billed: <del className="text-red-600 font-mono font-bold">₹{billAuditReport.total_billed_inr.toLocaleString()}</del></span>
                      <span className="text-emerald-800 font-mono font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                        Statutory Cap: ₹{billAuditReport.cghs_capped_total_inr.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Line Items Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-slate-500 border-b border-slate-200">
                          <th className="pb-2">Invoice Line Item</th>
                          <th className="pb-2">Billed Amount</th>
                          <th className="pb-2">CGHS Cap</th>
                          <th className="pb-2 text-red-600">Overcharge Flag</th>
                          <th className="pb-2">Statutory Reference</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans">
                        {billAuditReport.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2.5 text-slate-900 font-medium">{item.item_name}</td>
                            <td className="py-2.5 font-mono text-slate-700">₹{item.billed_amount_inr.toLocaleString()}</td>
                            <td className="py-2.5 font-mono text-emerald-700 font-bold">₹{item.cghs_cap_inr.toLocaleString()}</td>
                            <td className="py-2.5 font-mono font-bold text-red-600">
                              +₹{item.excess_amount_inr.toLocaleString()}
                            </td>
                            <td className="py-2.5 text-[11px] text-slate-500 font-mono">{item.package_reference}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Legal Notice */}
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-xs text-red-800 flex items-start gap-2">
                    <Scale className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
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

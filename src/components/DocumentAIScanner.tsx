"use client";

import React, { useState } from "react";
import { Upload, Sparkles, ShieldCheck, CreditCard } from "lucide-react";
import { CostBreakdown } from "@/lib/types";

interface DocumentAIScannerProps {
  onScanComplete: (details: {
    provider: string;
    idNumber: string;
    coverageInr: number;
    breakdown: CostBreakdown;
  }) => void;
  currentDepositInr: number;
}

export default function DocumentAIScanner({
  onScanComplete,
  currentDepositInr,
}: DocumentAIScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [scannedDoc, setScannedDoc] = useState<{
    name: string;
    idNumber: string;
    provider: string;
    type: string;
    coverageInr: number;
    subsidyInr: number;
  } | null>(null);

  const simulateDocAiScan = (type: "ABHA" | "PRIVATE") => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);

      if (type === "ABHA") {
        const breakdown: CostBreakdown = {
          items: [
            { item: "Emergency ICU Bed Soft-Lock & Setup", cost_inr: 8000, covered_by_insurance_pct: 100 },
            { item: "Trauma Bay Rapid Stabilization Kit", cost_inr: 5000, covered_by_insurance_pct: 100 },
            { item: "Whole Body Polytrauma CT (Pan-Scan)", cost_inr: 9000, covered_by_insurance_pct: 100 },
            { item: "Emergency Blood Bank Cross-Match (4 units)", cost_inr: 4500, covered_by_insurance_pct: 90 },
          ],
          subtotal_inr: 26500,
          abha_subsidy_inr: 5000,
          insurance_deductible_inr: 0,
          final_patient_deposit_inr: 0,
        };

        const result = {
          name: "Ayushman Bharat National Health Card",
          idNumber: "14-9921-5502-3819 (ABHA ID)",
          provider: "Ayushman Bharat PM-JAY (Govt of India)",
          type: "Govt Health ID",
          coverageInr: 500000,
          subsidyInr: 5000,
        };

        setScannedDoc(result);
        onScanComplete({
          provider: result.provider,
          idNumber: result.idNumber,
          coverageInr: result.coverageInr,
          breakdown,
        });
      } else {
        const breakdown: CostBreakdown = {
          items: [
            { item: "Emergency ICU Bed Soft-Lock & Setup", cost_inr: 8000, covered_by_insurance_pct: 100 },
            { item: "Trauma Bay Rapid Stabilization Kit", cost_inr: 5000, covered_by_insurance_pct: 100 },
            { item: "Whole Body Polytrauma CT (Pan-Scan)", cost_inr: 9000, covered_by_insurance_pct: 80 },
            { item: "Emergency Blood Bank Cross-Match", cost_inr: 4500, covered_by_insurance_pct: 80 },
          ],
          subtotal_inr: 26500,
          abha_subsidy_inr: 0,
          insurance_deductible_inr: 0,
          final_patient_deposit_inr: 0,
        };

        const result = {
          name: "Star Comprehensive Health Insurance",
          idNumber: "POL-STAR-88392019-MH",
          provider: "Star Health & Allied Insurance",
          type: "Private Cashless TPA",
          coverageInr: 1000000,
          subsidyInr: 0,
        };

        setScannedDoc(result);
        onScanComplete({
          provider: result.provider,
          idNumber: result.idNumber,
          coverageInr: result.coverageInr,
          breakdown,
        });
      }
    }, 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      simulateDocAiScan("PRIVATE");
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Document AI • ABHA &amp; Insurance Verification
          </h4>
        </div>
        <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">
          Instant Cashless Pre-Auth
        </span>
      </div>

      {scanning ? (
        <div className="py-6 flex flex-col items-center justify-center space-y-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          <div className="text-center">
            <div className="text-xs font-bold text-slate-900">Verifying Insurance Policy...</div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Querying National Health Stack (ABHA) gateway
            </p>
          </div>
        </div>
      ) : scannedDoc ? (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="text-xs font-bold text-slate-900">{scannedDoc.name}</span>
                <p className="text-xs text-emerald-800 font-mono mt-0.5">{scannedDoc.idNumber}</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              VERIFIED
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-500 font-medium">Total Sum Insured:</span>
              <p className="text-sm font-bold text-slate-900 font-mono mt-0.5">
                ₹{scannedDoc.coverageInr.toLocaleString("en-IN")}
              </p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Required Upfront Deposit:</span>
              <p className="text-sm font-bold text-emerald-700 font-mono mt-0.5">
                ₹0 (Cashless Pre-Admission)
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={() => simulateDocAiScan("ABHA")}
              className="text-xs text-slate-600 hover:text-slate-900 underline font-medium"
            >
              Scan Another Card
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            Scan Ayushman Bharat (ABHA) ID or private cashless card to auto-apply subsidies and skip billing counters:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={() => simulateDocAiScan("ABHA")}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-orange-100 border border-orange-200 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Ayushman Bharat (ABHA)</div>
                <div className="text-[11px] text-slate-500 mt-0.5">PM-JAY ₹5 Lakh Protection</div>
              </div>
            </button>

            <button
              onClick={() => simulateDocAiScan("PRIVATE")}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Star Health / Private TPA</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Instant Pre-Auth Waiver</div>
              </div>
            </button>
          </div>

          <label className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600 cursor-pointer text-xs transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Card Image / PDF</span>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  );
}

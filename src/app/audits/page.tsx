"use client";

import React, { useState, useEffect } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { MetricCard } from "@/components/ui/MetricCard";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { BillAudit } from "@/types";
import { getBillAudits } from "@/lib/firestore";
import { formatCurrency } from "@/lib/utils";
import {
  ShieldCheck,
  Building2,
  DollarSign,
  Sparkles,
  PlusCircle,
} from "lucide-react";

export default function AuditsPage() {
  const [audits, setAudits] = useState<BillAudit[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getBillAudits();
      setAudits(data);
    }
    load();
  }, []);

  const totalCharged = audits.reduce((acc, a) => acc + a.totalCharged, 0);
  const totalCghs = audits.reduce((acc, a) => acc + a.cghsAllowed, 0);
  const totalSavings = audits.reduce((acc, a) => acc + a.disputedSavings, 0);

  const handleRunSampleAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await fetch("/api/ai/bill-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hospitalName: "Alexis / Max Super Speciality Hospital",
          items: [
            { description: "ICU Day Care Tariff", chargedAmount: 19000 },
            { description: "Ventilator Support (24h)", chargedAmount: 11500 },
            { description: "Polytrauma CT Torso", chargedAmount: 13500 },
          ],
        }),
      });
      const newAudit = await res.json();
      setAudits((prev) => [newAudit, ...prev]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <DashboardShell
      title="AI Bill Guard & CGHS Pricing Audits"
      subtitle="Forensic Detection of Inflated Emergency Tariffs & Overcharges"
    >
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Disputed Overcharges"
          value={formatCurrency(totalSavings)}
          subtitle="Protected for Patient Families"
          icon={<ShieldCheck className="w-4 h-4 text-emerald-600" />}
          variant="success"
          trend={{ value: "100% CGHS Capped", isPositive: true }}
        />

        <MetricCard
          title="Billed vs Mandated Cap"
          value={formatCurrency(totalCharged)}
          unit={`vs ${formatCurrency(totalCghs)}`}
          subtitle="Mandated Ceiling Verification"
          icon={<DollarSign className="w-4 h-4 text-amber-600" />}
          variant="warning"
        />

        <MetricCard
          title="Flagged Hospitals"
          value="1 / 5"
          subtitle="Under Maharashtra Nursing Act"
          icon={<Building2 className="w-4 h-4 text-red-600" />}
          variant="emergency"
        />
      </div>

      {/* Action Banner */}
      <div className="p-4 rounded-xl bg-white border border-slate-300 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Automated CGHS Rate Schedule Compliance Engine</span>
          </h4>
          <p className="text-xs text-slate-600 mt-0.5">
            Compares itemized hospital invoices against Central Government Health Scheme 2024 pricing caps.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleRunSampleAudit}
          isLoading={isAuditing}
          leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
        >
          Run Gemini Bill Audit
        </Button>
      </div>

      {/* Audits Feed */}
      <div className="space-y-6">
        {audits.map((audit) => (
          <Card key={audit.id} variant={audit.status === "FLAGGED" ? "emergency" : "default"}>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-500 font-semibold">{audit.id}</span>
                  <span className="text-slate-900 font-bold text-base">{audit.hospitalName}</span>
                </div>
                <p className="text-xs text-slate-500 font-mono">
                  Patient: {audit.patientName} &bull; Audited on {audit.date}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant={audit.status === "FLAGGED" ? "emergency" : "success"} size="sm">
                  {audit.status}
                </Badge>
                <div className="text-right font-mono">
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">Excess Billed</span>
                  <span className="text-base font-bold text-red-700">
                    +{formatCurrency(audit.disputedSavings)}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Gemini AI forensic summary */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1.5 text-xs">
                <span className="font-semibold text-blue-900 flex items-center gap-1.5 text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Forensic Audit Finding
                </span>
                <p className="text-slate-800 leading-relaxed font-sans">
                  {audit.geminiAnalysisSummary}
                </p>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Code & Description</th>
                      <th className="p-3">Charged</th>
                      <th className="p-3">CGHS Cap</th>
                      <th className="p-3">Variance</th>
                      <th className="p-3">Audit Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {audit.items.map((item, i) => (
                      <tr key={i} className={item.isOvercharged ? "bg-red-50/60" : ""}>
                        <td className="p-3 text-slate-900 font-medium font-sans">
                          <span className="font-mono text-[10px] text-slate-500 block">{item.code}</span>
                          {item.description}
                        </td>
                        <td className="p-3 font-bold text-slate-900">{formatCurrency(item.chargedAmount)}</td>
                        <td className="p-3 text-slate-700">{formatCurrency(item.cghsCapAmount)}</td>
                        <td className="p-3">
                          {item.isOvercharged ? (
                            <span className="text-red-700 font-bold">+{item.variancePercentage}%</span>
                          ) : (
                            <span className="text-emerald-700 font-semibold">Compliant</span>
                          )}
                        </td>
                        <td className="p-3 text-[11px] text-slate-600 font-sans">{item.notes || "Matches schedule"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { MetricCard } from "@/components/ui/MetricCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { BillAudit } from "@/types";
import { getBillAudits, createBillAudit } from "@/lib/firestore";
import { formatCurrency } from "@/lib/utils";
import {
  FileCheck2,
  AlertTriangle,
  ShieldCheck,
  Building2,
  DollarSign,
  Sparkles,
  Download,
  PlusCircle,
} from "lucide-react";

export default function AuditsPage() {
  const [audits, setAudits] = useState<BillAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuditing, setIsAuditing] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getBillAudits();
      setAudits(data);
      setLoading(false);
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
          icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
          variant="success"
          trend={{ value: "100% CGHS Capped", isPositive: true }}
        />

        <MetricCard
          title="Billed vs Mandated Cap"
          value={formatCurrency(totalCharged)}
          unit={`vs ${formatCurrency(totalCghs)}`}
          subtitle="Mandated Ceiling Verification"
          icon={<DollarSign className="w-4 h-4 text-amber-400" />}
          variant="warning"
        />

        <MetricCard
          title="Flagged Hospitals"
          value="1 / 5"
          subtitle="Under Maharashtra Nursing Act"
          icon={<Building2 className="w-4 h-4 text-red-400" />}
          variant="emergency"
        />
      </div>

      {/* Action Banner */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Automated CGHS Rate Schedule Compliance Engine</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
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
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-400">{audit.id}</span>
                  <span className="text-slate-100 font-bold text-base">{audit.hospitalName}</span>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  Patient: {audit.patientName} &bull; Audited on {audit.date}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant={audit.status === "FLAGGED" ? "emergency" : "success"} size="sm">
                  {audit.status}
                </Badge>
                <div className="text-right font-mono">
                  <span className="text-[10px] text-slate-400 block uppercase">Excess Billed</span>
                  <span className="text-base font-bold text-red-400">
                    +{formatCurrency(audit.disputedSavings)}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Gemini AI forensic summary */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs">
                <span className="font-mono text-blue-400 font-semibold flex items-center gap-1.5 text-[11px]">
                  <Sparkles className="w-3.5 h-3.5" />
                  Forensic Audit Finding
                </span>
                <p className="text-slate-300 leading-relaxed font-sans">
                  {audit.geminiAnalysisSummary}
                </p>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3">Code & Description</th>
                      <th className="p-3">Charged</th>
                      <th className="p-3">CGHS Cap</th>
                      <th className="p-3">Variance</th>
                      <th className="p-3">Audit Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                    {audit.items.map((item, i) => (
                      <tr key={i} className={item.isOvercharged ? "bg-red-950/20" : ""}>
                        <td className="p-3 text-slate-200 font-medium font-sans">
                          <span className="font-mono text-[10px] text-slate-400 block">{item.code}</span>
                          {item.description}
                        </td>
                        <td className="p-3 font-bold text-slate-100">{formatCurrency(item.chargedAmount)}</td>
                        <td className="p-3 text-slate-300">{formatCurrency(item.cghsCapAmount)}</td>
                        <td className="p-3">
                          {item.isOvercharged ? (
                            <span className="text-red-400 font-bold">+{item.variancePercentage}%</span>
                          ) : (
                            <span className="text-emerald-400">Compliant</span>
                          )}
                        </td>
                        <td className="p-3 text-[11px] text-slate-400 font-sans">{item.notes || "Matches schedule"}</td>
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

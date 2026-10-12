"use client";

import React from "react";
import Link from "next/link";
import { useTraumaNet } from "@/lib/TraumaNetContext";
import {
  Ambulance,
  Building2,
  Users,
  Activity,
  ArrowRight,
  ShieldCheck,
  Compass,
  Zap,
  Lock,
  FileCheck2,
  PhoneCall,
  CheckCircle2,
} from "lucide-react";

export default function HomeHubPage() {
  const { injectEmergencyScenario, resetAllData } = useTraumaNet();

  const roles = [
    {
      title: "Paramedic Mobile App",
      href: "/paramedic",
      icon: Ambulance,
      badge: "Fleet Node #108 • Nagpur",
      iconBg: "bg-red-50 text-red-600 border border-red-200",
      description:
        "Direct field vitals entry (BP, Pulse, SpO2, RR), regional Hindi/Marathi voice dictation, wound image capture, and Gemini 1.5 multimodal SBAR handover generation.",
      actionLabel: "Open Paramedic Terminal",
    },
    {
      title: "Hospital ER Command Center",
      href: "/hospital-er",
      icon: Building2,
      badge: "Kingsway / AIIMS • Grade A+",
      iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-200",
      description:
        "Audible incoming emergency banner, 15-minute ICU bed soft-lock reservation, Gemini 4-quadrant SBAR report, and one-click rapid pre-alert checklists.",
      actionLabel: "Open ER Command View",
    },
    {
      title: "Nagpur Emergency GPS Map",
      href: "/map",
      icon: Compass,
      badge: "Turn-by-Turn Routing (OSRM)",
      iconBg: "bg-blue-50 text-blue-600 border border-blue-200",
      description:
        "Real-time Nagpur accident corridors (Wardha Flyover, Samruddhi Jamtha, Kamptee) with live shortest-path calculations and hospital bed hold badges.",
      actionLabel: "Open GPS Corridor Map",
    },
    {
      title: "Family Portal & Bill Guard",
      href: "/family-portal",
      icon: Users,
      badge: "Supreme Court Guarantee",
      iconBg: "bg-indigo-50 text-indigo-600 border border-indigo-200",
      description:
        "Real-time transit timeline, paperless ABHA pre-registration with deferred ₹0 deposit, and After-Care AI Bill Guard auditing against CGHS price caps.",
      actionLabel: "Open Family Portal",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200 py-10 sm:py-14 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Nagpur Emergency Pilot Network • Golden Hour Care Grid</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                TraumaNet Emergency Logistics
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Eliminating the three fatal Golden Hour delays in trauma care:{" "}
                <strong className="text-slate-800">clinical uncertainty en-route</strong> via multimodal Gemini SBAR,{" "}
                <strong className="text-slate-800">ICU bed mismatch</strong> via 15-minute guaranteed soft-locks, and{" "}
                <strong className="text-slate-800">billing counter delays</strong> via cashless pre-admission.
              </p>
            </div>

            {/* Quick Demo Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/live"
                className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Activity className="w-4 h-4" />
                <span>🔲 Open 3-Pane Live Cockpit</span>
              </Link>
              <button
                onClick={() => injectEmergencyScenario(0)}
                className="px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Inject Test Case</span>
              </button>
              <button
                onClick={resetAllData}
                className="px-3 py-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Triad Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Multimodal Gemini 1.5 Triage</div>
                <div className="text-xs text-slate-500">Hindi/Marathi translated clinical SBAR</div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">15-Min ICU Bed Soft-Lock</div>
                <div className="text-xs text-slate-500">Nagpur Partner Centers (94.2% Grade A+)</div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Supreme Court Cashless Guarantee</div>
                <div className="text-xs text-slate-500">Zero-delay admission &amp; CGHS Bill Guard</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Synchronized Terminal Cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Emergency Operation Terminals</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Open any module individually or use the 3-Pane Cockpit for synchronized real-time evaluation:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.href}
                className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${role.iconBg} flex items-center justify-center shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{role.title}</h3>
                        <span className="text-[11px] font-mono text-slate-500">{role.badge}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{role.description}</p>
                </div>

                <Link
                  href={role.href}
                  className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>{role.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

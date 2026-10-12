"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTraumaNet } from "@/lib/TraumaNetContext";
import {
  Ambulance,
  Building2,
  Users,
  Activity,
  ArrowRight,
  ShieldAlert,
  Clock,
  Sparkles,
  Navigation,
  Scale,
  Award,
  Zap,
} from "lucide-react";

export default function HomeHubPage() {
  const { activeSession, injectEmergencyScenario, resetAllData } = useTraumaNet();

  const roles = [
    {
      title: "Paramedic Mobile App",
      href: "/paramedic",
      icon: Ambulance,
      badge: "Node #108 • Nagpur Pilot",
      accent: "border-red-500/40 bg-slate-900/80 hover:border-red-500/80",
      iconBg: "bg-[#EF4444]",
      description:
        "Manual vitals intake (BP, Pulse, SpO2, RR), local Hindi/Marathi voice dictation, camera wound capture, and Gemini 1.5 SBAR triage.",
      actionLabel: "Open Paramedic App",
    },
    {
      title: "Hospital ER Command Center",
      href: "/hospital-er",
      icon: Building2,
      badge: "AIIMS Nagpur • Grade A+ (94.2%)",
      accent: "border-emerald-500/40 bg-slate-900/80 hover:border-emerald-500/80",
      iconBg: "bg-[#10B981]",
      description:
        "Auditory alert chime banner, Gemini SBAR 4-quadrant report, 15-minute ICU bed soft-lock countdown, and pre-alert checklists.",
      actionLabel: "Open ER Command",
    },
    {
      title: "Family Pre-Registration & Bill Guard",
      href: "/family-portal",
      icon: Users,
      badge: "Supreme Court Care Guarantee",
      accent: "border-blue-500/40 bg-slate-900/80 hover:border-blue-500/80",
      iconBg: "bg-[#3B82F6]",
      description:
        "Live transit timeline, paperless ABHA pre-registration with deferred deposits, and forensic AI Bill Guard auditing against CGHS price caps.",
      actionLabel: "Open Family Portal",
    },
    {
      title: "Google Maps Driving Navigation HUD",
      href: "/navigation",
      icon: Navigation,
      badge: "Live Vector & Corridors",
      accent: "border-cyan-500/40 bg-slate-900/80 hover:border-cyan-500/80",
      iconBg: "bg-cyan-600",
      description:
        "Dedicated full-screen Google Maps driving HUD with turn-by-turn guidance and live green corridor routing to the assigned trauma bay.",
      actionLabel: "Open Driving HUD",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 pb-24 relative overflow-hidden font-sans">
      {/* Subtle Glowing Radial Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-72 right-10 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Header */}
      <section className="relative z-10 border-b border-slate-800 py-12 px-4 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
                  Golden Hour Healthcare Platform • India Pilot
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                TraumaNet Emergency Grid
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                Eliminating the 3 fatal Golden Hour bottlenecks in trauma care: <strong>medical uncertainty</strong> en-route via multimodal Gemini 1.5, <strong>ICU bed mismatch</strong> via 15-minute flight-booking soft-locks, and <strong>billing counter delay</strong> via Supreme Court-mandated cashless pre-admission.
              </p>
            </div>

            {/* Quick Demo Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => injectEmergencyScenario(0)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Inject 30-Sec Test Intake</span>
              </button>
              <button
                onClick={resetAllData}
                className="px-3.5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors cursor-pointer"
              >
                Reset All
              </button>
            </div>
          </div>

          {/* Golden Hour Triad Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="backdrop-blur-md bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-center gap-3">
              <span className="text-xl">🩺</span>
              <div>
                <div className="text-xs font-bold text-white">Multimodal Gemini 1.5 SBAR</div>
                <div className="text-[11px] text-slate-400">Hindi/Marathi translated handover</div>
              </div>
            </div>
            <div className="backdrop-blur-md bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-center gap-3">
              <span className="text-xl">🔒</span>
              <div>
                <div className="text-xs font-bold text-white">15-Min ICU Bed Soft-Lock</div>
                <div className="text-[11px] text-slate-400">Nagpur Pilot 94.2% Grade A+ ranking</div>
              </div>
            </div>
            <div className="backdrop-blur-md bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-center gap-3">
              <span className="text-xl">⚖️</span>
              <div>
                <div className="text-xs font-bold text-white">Supreme Court &amp; Bill Guard</div>
                <div className="text-[11px] text-slate-400">Zero-delay admission &amp; CGHS audit</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid of Synchronized Roles */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 py-10 space-y-8">
        <div>
          <h2 className="text-lg font-bold text-white mb-1">Three Real-Time Synchronized Terminals</h2>
          <p className="text-xs text-slate-400">
            Open these across tabs or demo side-by-side on stage to observe sub-second state sync:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.href}
                className={`backdrop-blur-md border shadow-2xl rounded-2xl p-6 transition-all space-y-4 flex flex-col justify-between ${role.accent}`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl ${role.iconBg} flex items-center justify-center text-white shadow-md`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-white">{role.title}</h3>
                        <span className="text-[11px] font-mono text-slate-400">{role.badge}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{role.description}</p>
                </div>

                <Link
                  href={role.href}
                  className="w-full py-3 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-white font-extrabold text-xs border border-slate-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>{role.actionLabel}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

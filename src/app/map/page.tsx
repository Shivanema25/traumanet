"use client";

import React from "react";
import NagpurMap from "@/components/NagpurMap";
import { Navigation, Compass, Building2, ShieldAlert, ArrowLeft, Ambulance } from "lucide-react";
import Link from "next/link";

export default function NagpurMapPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 p-4 md:p-8 max-w-6xl mx-auto font-sans pb-28 relative overflow-hidden">
      {/* Background glowing radial gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-80 right-10 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-5 mb-6 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home Hub
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Compass className="w-6 h-6 text-[#3B82F6]" />
            Nagpur Emergency Routing Grid &amp; Shortest Path Corridor
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Open Source Routing Machine (OSRM) • Live Traffic Turn-by-Turn • ICU Bed Soft-Lock Integration
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/paramedic"
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-800 transition-colors flex items-center gap-1.5"
          >
            <Ambulance className="w-3.5 h-3.5 text-red-400" />
            <span>Paramedic Intake</span>
          </Link>
          <Link
            href="/hospital-er"
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>ER Command View</span>
          </Link>
        </div>
      </div>

      {/* Main Nagpur Map */}
      <div className="relative z-10 space-y-6">
        <NagpurMap height="560px" showSoftLockAction={true} />

        {/* Emergency Corridor Notes */}
        <div className="backdrop-blur-md bg-slate-900/80 border border-slate-800 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" /> Wardha Road Corridor
            </span>
            <p className="text-slate-400">
              Primary rapid artery connecting city center to AIIMS Nagpur &amp; MIHAN special economic zone.
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Samruddhi Mahamarg (Jamtha)
            </span>
            <p className="text-slate-400">
              High-speed expressway interchange with dedicated Golden Hour trauma response vector.
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Automotive Square (Kamptee)
            </span>
            <p className="text-slate-400">
              Heavy freight corridor routed through north bypass to Alexis / Max and Kingsway Hospitals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

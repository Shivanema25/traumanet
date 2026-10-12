"use client";

import React from "react";
import NagpurMap from "@/components/NagpurMap";
import { Compass, Building2, ArrowLeft, Ambulance, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function NagpurMapPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 max-w-6xl mx-auto font-sans pb-24">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-5 mb-6 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link
              href="/"
              className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home Hub
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Compass className="w-6 h-6 text-blue-600" />
            Nagpur Emergency Routing Grid &amp; Shortest Path Corridors
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Open Source Routing Machine (OSRM) • Live Traffic Turn-by-Turn • 15-Minute ICU Bed Soft-Lock
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/paramedic"
            className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-300 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Ambulance className="w-3.5 h-3.5 text-red-600" />
            <span>Paramedic Intake</span>
          </Link>
          <Link
            href="/hospital-er"
            className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>ER Command View</span>
          </Link>
        </div>
      </div>

      {/* Main Nagpur Map */}
      <div className="space-y-6">
        <NagpurMap height="540px" showSoftLockAction={true} />

        {/* Emergency Corridor Notes */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs shadow-xs">
          <div className="space-y-1">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Wardha Road / Airport Flyover
            </span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              High density corridor connecting South Nagpur to MIHAN. Rapid access to AIIMS Nagpur Level-1 trauma unit.
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Samruddhi Mahamarg (Jamtha)
            </span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              High-speed expressway interchange with frequent severe high-G vehicle collisions requiring neuro-trauma standby.
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Automotive Square (Kamptee)
            </span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Heavy industrial and freight corridor in North Nagpur. Rapid routing to Kingsway Hospitals and Alexis/Max.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

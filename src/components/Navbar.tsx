"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTraumaNet } from "@/lib/TraumaNetContext";
import {
  Ambulance,
  Building2,
  Users,
  Zap,
  Activity,
  Layers,
  Settings,
  Compass,
  Phone,
  ShieldCheck,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const {
    injectEmergencyScenario,
    useLiveGemini,
    setUseLiveGemini,
    geminiApiKey,
    setGeminiApiKey,
  } = useTraumaNet();

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [injecting, setInjecting] = useState(false);

  const handleQuickInject = () => {
    setInjecting(true);
    injectEmergencyScenario(Math.floor(Math.random() * 3));
    setTimeout(() => setInjecting(false), 500);
  };

  const navLinks = [
    { href: "/", label: "Home Hub", icon: Layers },
    { href: "/live", label: "Live Cockpit", icon: Activity },
    { href: "/paramedic", label: "Paramedic", icon: Ambulance },
    { href: "/hospital-er", label: "Hospital ER", icon: Building2 },
    { href: "/map", label: "Nagpur Map", icon: Compass },
    { href: "/family-portal", label: "Family Portal", icon: Users },
    { href: "/admin-demo", label: "Demo & Judging", icon: Zap },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-xs">
        {/* Top Micro Bar (Matching Shreeram Sales Clean Pattern) */}
        <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 border-b border-slate-800">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-semibold text-white">Emergency 108 Vector</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-300">Nagpur Trauma Pilot Network</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-emerald-400 font-medium hidden sm:inline flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
                ICU Soft-Lock Verified
              </span>
              <span className="text-slate-400">|</span>
              <a href="tel:108" className="text-slate-200 hover:text-white font-semibold flex items-center gap-1">
                <Phone className="w-3 h-3 text-red-400" />
                <span>Helpline: 108 / 112</span>
              </a>
            </div>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-sm group-hover:bg-red-700 transition-colors">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-black text-lg tracking-tight text-slate-900">
                  TRAUMA<span className="text-red-600">NET</span>
                </span>
                <p className="text-[11px] text-slate-500 leading-none hidden sm:block">
                  Emergency Triage &amp; Bed Logistics
                </p>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? "bg-red-50 text-red-700 border border-red-200 shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-red-600" : "text-slate-500"
                      }`}
                    />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleQuickInject}
                disabled={injecting}
                title="Inject test emergency scenario"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-xs ${
                  injecting
                    ? "bg-amber-600 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Inject Case</span>
              </button>

              <button
                onClick={() => setShowSettingsModal(true)}
                title="AI Settings"
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden border-t border-slate-200 bg-white px-2 py-1.5 flex items-center justify-around overflow-x-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center py-1 px-2 text-[11px] font-semibold rounded-lg shrink-0 ${
                  isActive ? "text-red-600 bg-red-50" : "text-slate-600"
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Clean White Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">TraumaNet AI Engine Settings</h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <label className="flex items-center justify-between cursor-pointer font-bold text-slate-900 text-sm">
                  <span>Use Live Google Gemini 1.5 API</span>
                  <input
                    type="checkbox"
                    checked={useLiveGemini}
                    onChange={(e) => setUseLiveGemini(e.target.checked)}
                    className="w-4 h-4 accent-red-600 rounded"
                  />
                </label>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  When enabled, patient vitals &amp; trauma wound photos call Google Gemini 1.5 for multimodal clinical SBAR reasoning.
                </p>
              </div>

              {useLiveGemini && (
                <div className="space-y-1.5">
                  <label className="block text-slate-700 font-semibold text-xs">
                    Custom Gemini API Key (Optional)
                  </label>
                  <input
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="AIzaSy... (leave blank to use default)"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
              >
                Save &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

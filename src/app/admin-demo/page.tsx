"use client";

import React, { useState } from "react";
import { useTraumaNet } from "@/lib/TraumaNetContext";
import { DEMO_SCENARIOS } from "@/lib/mockData";
import {
  Zap,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Play,
  Key,
  Activity,
  Code,
  ArrowLeft,
} from "lucide-react";
import LiveMap from "@/components/LiveMap";
import Link from "next/link";

export default function AdminDemoPage() {
  const {
    activeSession,
    hospitals,
    injectEmergencyScenario,
    resetAllData,
    useLiveGemini,
    setUseLiveGemini,
    geminiApiKey,
    setGeminiApiKey,
    simulateAmbulanceProgress,
  } = useTraumaNet();

  const [injectedMessage, setInjectedMessage] = useState<string | null>(null);
  const [testingApiKey, setTestingApiKey] = useState(false);
  const [keyTestStatus, setKeyTestStatus] = useState<string | null>(null);

  const handleInject = (index: number) => {
    const session = injectEmergencyScenario(index);
    setInjectedMessage(
      `Injected Case #${index + 1}: ${session.incident_title} (${session.severity})`
    );
    setTimeout(() => setInjectedMessage(null), 4000);
  };

  const handleTestGemini = async () => {
    setTestingApiKey(true);
    setKeyTestStatus("Testing Gemini API connection...");

    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vitals: {
            blood_pressure_sys: 90,
            blood_pressure_dia: 60,
            pulse_rate: 130,
            spo2: 89,
            respiratory_rate: 28,
            gcs_score: 11,
          },
          notes: "Live API Key Connectivity Test - 35yo male polytrauma victim en-route",
          apiKey: geminiApiKey || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setKeyTestStatus("✅ Success! Gemini 1.5 Flash responded with valid SBAR JSON.");
      } else {
        setKeyTestStatus(`❌ API Error: ${data.error || "Failed to contact Gemini"}`);
      }
    } catch {
      setKeyTestStatus("❌ Network error connecting to /api/triage endpoint.");
    } finally {
      setTestingApiKey(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E6EDF4] text-slate-900 pb-20 font-sans">
      {/* Top Demo Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3.5 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shadow-xs">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900">
                Demo &amp; Evaluation Console
              </h1>
              <p className="text-xs text-slate-500">
                1-Click Emergency Scenario Injection &amp; Live Telemetry Inspector
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/live"
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>3-Pane Live Cockpit</span>
            </Link>
            <button
              onClick={resetAllData}
              className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Flash banner */}
        {injectedMessage && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5 shadow-xs">
            <Zap className="w-4 h-4 text-amber-600 shrink-0 fill-current" />
            <span className="font-semibold">{injectedMessage}</span>
          </div>
        )}

        {/* Section 1: 30-Second Scenario Injector */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600 fill-current" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Inject Emergency Scenarios (Stage Demo)
              </h2>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Trigger a complete end-to-end incident in 1 click. Watch the Paramedic terminal, ER Command Tower chime, and Family Portal update synchronously:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {DEMO_SCENARIOS.map((scenario, index) => (
              <div
                key={index}
                className="bg-slate-50 p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold">
                      Score: {scenario.trauma_score} • {scenario.severity}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Case #{index + 1}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-xs mt-2">{scenario.incident_title}</h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    {scenario.ai_pre_report}
                  </p>
                </div>

                <button
                  onClick={() => handleInject(index)}
                  className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Inject Case #{index + 1}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: AI Engine Switcher & Live Gemini Key Config */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                AI Triage Engine Selector (Deterministic vs. Live Gemini 1.5)
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mode Toggle */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2.5">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Use Live Google Gemini 1.5 API
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    Multimodal clinical reasoning via Gemini Flash
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={useLiveGemini}
                  onChange={(e) => setUseLiveGemini(e.target.checked)}
                  className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                />
              </label>

              <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded border border-slate-200 font-medium">
                {useLiveGemini
                  ? "Status: Live Gemini API Mode Active. Multimodal inputs processed via Gemini 1.5."
                  : "Status: Deterministic ATLS Fallback Engine Active. Scores computed offline."}
              </div>
            </div>

            {/* Key Input & Test */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2.5">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-blue-600" />
                <span>Gemini API Key</span>
              </label>

              <div className="flex gap-2">
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="Paste AIzaSy... or leave blank for env key"
                  className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-red-500"
                />
                <button
                  onClick={handleTestGemini}
                  disabled={testingApiKey}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  {testingApiKey ? "Testing..." : "Test Key"}
                </button>
              </div>

              {keyTestStatus && (
                <p className="text-[11px] font-mono font-medium text-slate-700">
                  {keyTestStatus}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Live Map & Ambulance Movement Simulator */}
        {activeSession && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Interactive Ambulance Corridor &amp; Hospital Network
                </h3>
              </div>
              <button
                onClick={simulateAmbulanceProgress}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Advance Ambulance ETA (-2m)
              </button>
            </div>

            <LiveMap session={activeSession} hospitals={hospitals} height="360px" />
          </div>
        )}

        {/* Section 4: Live Session JSON Inspector */}
        {activeSession && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Real-Time Database Inspector (Live Synchronized Document)
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-500">
                Session: {activeSession.session_id}
              </span>
            </div>

            <div className="max-h-64 overflow-auto bg-slate-900 p-4 rounded-lg font-mono text-xs text-emerald-400">
              <pre>{JSON.stringify(activeSession, null, 2)}</pre>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Camera, Mic, Activity, ShieldAlert, Send, ArrowRight, Building2, Navigation } from "lucide-react";
import { useTraumaNet } from "@/lib/TraumaNetContext";
import Link from "next/link";

export default function ParamedicInputScreen() {
  const { createSession, hospitals } = useTraumaNet();

  // Manual User Input States (No auto-simulation)
  const [bp, setBp] = useState("");
  const [pulse, setPulse] = useState("");
  const [spo2, setSpo2] = useState("");
  const [notes, setNotes] = useState(""); // Supports Hindi / Marathi / Hinglish
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [aiReport, setAiReport] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    if (selectedImage) {
      formData.append("image", selectedImage);
    }
    formData.append("vitals", JSON.stringify({ bp, pulse, spo2 }));
    formData.append("notes", notes);

    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setAiReport(data.data);

        // Sync with TraumaNet Context for ER Command Tower & Family Portal
        const parts = (bp || "120/80").split(/[\/\s-]+/);
        const sys = Number(parts[0]) || 120;
        const dia = Number(parts[1]) || 80;

        const newSession = createSession({
          incident_title: notes ? notes.slice(0, 48) : "Paramedic Inbound Intake",
          patient_info: {
            name: "Emergency Inbound Patient",
            age: 35,
            gender: "MALE",
            emergency_contact_name: "Anita Narang (Spouse)",
            emergency_contact_phone: "+91 98112 45890",
          },
          vitals: {
            blood_pressure_sys: sys,
            blood_pressure_dia: dia,
            pulse_rate: Number(pulse) || 80,
            spo2: Number(spo2) || 98,
            respiratory_rate: 18,
            gcs_score: 14,
          },
          trauma_score: Number(data.data.trauma_score) || 7.5,
          severity: data.data.urgency || "HIGH",
          urgency: data.data.urgency || "HIGH",
          sbar: data.data.sbar,
          ai_pre_report: data.data.sbar ? `${data.data.sbar.situation} ${data.data.sbar.assessment}` : "Patient triage complete.",
          required_specialists: data.data.required_specialists || ["Trauma Surgeon"],
          injury_image_url: imagePreview || undefined,
          voice_notes: notes,
          raw_paramedic_notes: notes,
          bed_status: "HOLD",
          assigned_hospital_id: hospitals[0]?.hospital_id || "hosp-aiims-01",
        });
        setSessionId(newSession.session_id);
      } else {
        alert("Error: " + data.error);
      }
    } catch {
      alert("Failed to connect to Gemini API.");
    } finally {
      setLoading(false);
    }
  };

  const samplePhrases = [
    { label: "Hindi: बाइक एक्सीडेंट", text: "35 साल का पुरुष, बाइक एक्सीडेंट, सिर में गहरी चोट, काफी खून बह रहा है" },
    { label: "Marathi: डोक्याला दुखापत", text: "३५ वर्षांचा पुरुष, बाईक अपघात, डोक्याला गंभीर मार, खूप रक्तस्राव" },
    { label: "Hinglish: Chest Trauma", text: "Patient bike crash se hai, severe chest injury, saas lene me taklif" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 max-w-3xl mx-auto font-sans pb-24">
      {/* Aesthetic Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-500" /> Paramedic Inbound Intake
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manual Emergency Vitals &amp; AI Multi-Modal Triage</p>
        </div>
        <span className="text-xs bg-red-950 text-red-400 border border-red-800/60 px-3 py-1 rounded-full font-mono">
          OFFLINE / ONLINE READY
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Section 1: Manual Vitals */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" /> 1. Manual Vitals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Blood Pressure (BP)</label>
              <input
                type="text"
                placeholder="e.g. 120/80"
                value={bp}
                onChange={(e) => setBp(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Pulse (BPM)</label>
              <input
                type="text"
                placeholder="e.g. 88"
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">SpO2 (%)</label>
              <input
                type="text"
                placeholder="e.g. 96"
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Local Language Notes */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Mic className="w-4 h-4 text-amber-400" /> 2. Notes / Observations (Hindi / Marathi / English)
            </h2>
          </div>

          <textarea
            rows={3}
            placeholder="Type notes here (e.g. Patient bike crash se hai, severe chest injury, saas lene me taklif...)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
          />

          {/* Quick Regional Suggestion Tags */}
          <div className="flex flex-wrap gap-2 mt-2.5">
            {samplePhrases.map((sample, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setNotes(sample.text)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
              >
                + {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section 3: Injury Image Upload */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-400" /> 3. Injury Photo Upload
          </h2>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
          />
          {imagePreview && (
            <div className="mt-3">
              <img src={imagePreview} alt="Injury Preview" className="h-32 rounded-xl border border-slate-800 object-cover" />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-semibold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
        >
          {loading ? (
            "Processing with Gemini 1.5..."
          ) : (
            <>
              <Send className="w-4 h-4" /> Analyze &amp; Generate SBAR Handover
            </>
          )}
        </button>
      </form>

      {/* Gemini SBAR Output Display */}
      {aiReport && (
        <div className="mt-8 bg-slate-900 border border-blue-500/30 rounded-2xl p-6 space-y-4 backdrop-blur-md shadow-2xl animate-in fade-in duration-300">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <span className="text-xs uppercase tracking-wider font-bold text-blue-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Gemini AI Handover Pre-Report
            </span>
            <span className="text-xs px-2.5 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full font-semibold">
              Score: {aiReport.trauma_score} / 10 ({aiReport.urgency})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="font-bold text-red-400 block mb-1">S - Situation</span>
              <p className="text-slate-300 leading-relaxed">{aiReport.sbar?.situation}</p>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="font-bold text-blue-400 block mb-1">B - Background</span>
              <p className="text-slate-300 leading-relaxed">{aiReport.sbar?.background}</p>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="font-bold text-amber-400 block mb-1">A - Assessment</span>
              <p className="text-slate-300 leading-relaxed">{aiReport.sbar?.assessment}</p>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="font-bold text-emerald-400 block mb-1">R - Recommendation</span>
              <p className="text-slate-300 leading-relaxed">{aiReport.sbar?.recommendation}</p>
            </div>
          </div>

          {/* Quick Action Buttons to ER and Maps */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-emerald-400 font-semibold">
              ✓ Synchronized with Hospital ER Command &amp; Bed Soft-Locked
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link
                href="/hospital-er"
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Hospital ER View</span>
              </Link>
              <Link
                href="/navigation"
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Google Maps HUD</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

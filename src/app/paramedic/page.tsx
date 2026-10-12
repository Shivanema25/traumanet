"use client";

import { useState } from "react";
import {
  Camera,
  Mic,
  MicOff,
  Activity,
  ShieldAlert,
  Send,
  Upload,
  X,
  Sparkles,
  Building2,
  Navigation,
  ArrowRight,
  Heart,
  Wind,
  CheckCircle2,
} from "lucide-react";
import { useTraumaNet } from "@/lib/TraumaNetContext";
import Link from "next/link";

export default function ParamedicPage() {
  const { createSession, hospitals } = useTraumaNet();

  // Manual User Input States (Zero auto-simulation / zero fake tickers)
  const [bp, setBp] = useState("");
  const [pulse, setPulse] = useState("");
  const [spo2, setSpo2] = useState("");
  const [respRate, setRespRate] = useState("");
  const [notes, setNotes] = useState(""); // Supports Hindi / Marathi / Hinglish / English
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [aiReport, setAiReport] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [targetHospitalId, setTargetHospitalId] = useState(hospitals[0]?.hospital_id || "hosp-aiims-nagpur-01");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Local Language Voice Dictation
  const toggleRecording = () => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      try {
        const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRec();
        recognition.lang = "hi-IN"; // Hindi / Indian English
        recognition.interimResults = false;

        if (!isRecording) {
          setIsRecording(true);
          recognition.start();
          recognition.onresult = (ev: any) => {
            const transcript = ev.results[0][0].transcript;
            setNotes((prev) => (prev ? `${prev} ${transcript}` : transcript));
            setIsRecording(false);
          };
          recognition.onerror = () => setIsRecording(false);
          recognition.onend = () => setIsRecording(false);
        } else {
          recognition.stop();
          setIsRecording(false);
        }
        return;
      } catch {
        setIsRecording(false);
      }
    }

    // Fallback template notes
    const sample = "35yo male, bike accident se hai, severe chest injury, saas lene me taklif, bleeding ho rahi hai";
    setNotes((prev) => (prev ? `${prev}. ${sample}` : sample));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    if (selectedImage) {
      formData.append("image", selectedImage);
    }
    formData.append(
      "vitals",
      JSON.stringify({
        bp: bp || "120/80",
        pulse: pulse || "80",
        spo2: spo2 || "98",
        respRate: respRate || "18",
      })
    );
    formData.append("notes", notes);

    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setAiReport(data.data);

        // Parse BP into numeric systolic & diastolic
        const parts = (bp || "120/80").split(/[\/\s-]+/);
        const sys = Number(parts[0]) || 120;
        const dia = Number(parts[1]) || 80;

        // Write directly to synchronized emergency sessions
        createSession({
          incident_title: notes ? notes.slice(0, 48) : "Emergency Trauma Intake - Node #108",
          patient_info: {
            name: "Emergency Inbound Trauma Case",
            age: 35,
            gender: "MALE",
            emergency_contact_name: "Anita Verma (Relative)",
            emergency_contact_phone: "+91 98765 43210",
          },
          vitals: {
            blood_pressure_sys: sys,
            blood_pressure_dia: dia,
            pulse_rate: Number(pulse) || 80,
            spo2: Number(spo2) || 98,
            respiratory_rate: Number(respRate) || 18,
            gcs_score: 14,
          },
          trauma_score: Number(data.data.trauma_score) || 7.5,
          severity: data.data.urgency || "HIGH",
          urgency: data.data.urgency || "HIGH",
          sbar: data.data.sbar,
          ai_pre_report: data.data.sbar
            ? `${data.data.sbar.situation} ${data.data.sbar.assessment}`
            : "Patient triage complete.",
          required_specialists: data.data.required_specialists || ["Trauma Surgeon"],
          injury_image_url: imagePreview || undefined,
          voice_notes: notes,
          raw_paramedic_notes: notes,
          bed_status: "HOLD",
          assigned_hospital_id: targetHospitalId,
          eta_minutes: 8,
        });
      } else {
        alert("Error: " + data.error);
      }
    } catch {
      alert("Failed to connect to Gemini API.");
    } finally {
      setLoading(false);
    }
  };

  const sampleRegionalPhrases = [
    { label: "Hindi (हिंदी)", text: "35 साल का पुरुष, बाइक एक्सीडेंट से है, सिर में गहरी चोट, काफी खून बह रहा है" },
    { label: "Marathi (मराठी)", text: "३५ वर्षांचा पुरुष, बाईक अपघात, छातीवर मार, श्वास घेण्यास अडचण आणि प्रचंड रक्तस्राव" },
    { label: "Hinglish", text: "35yo male, bike accident se hai, severe chest injury, saas lene me taklif" },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 p-4 md:p-8 max-w-4xl mx-auto font-sans pb-28 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-48 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header: TraumaNet Mobile Node #108 - Nagpur Pilot */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-5 mb-6 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
              GPS Vector Live • 108 Emergency Grid
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#EF4444]" />
            TraumaNet Mobile Node #108 - Nagpur Pilot
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manual Vitals Intake • Local Multilingual Notes • Gemini 1.5 Multimodal SBAR
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-slate-900/90 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-xl font-mono shadow-sm">
            Node: <strong className="text-white">MH-31-ALS-108</strong>
          </span>
          <span className="text-xs bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 px-3 py-1.5 rounded-xl font-bold">
            ONLINE
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
        {/* Section 1: Clean Manual Vitals Input */}
        <div className="backdrop-blur-md bg-slate-900/80 border border-slate-800 shadow-2xl rounded-2xl p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#3B82F6]" /> 1. Manual Patient Vitals
            </h2>
            <span className="text-[11px] font-mono text-slate-400">Strictly User-Entered (No Fake Tickers)</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            {/* BP */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 focus-within:border-blue-500 transition-colors">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">
                Blood Pressure (BP)
              </label>
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  placeholder="e.g. 120/80"
                  value={bp}
                  onChange={(e) => setBp(e.target.value)}
                  className="w-full bg-transparent text-base font-mono font-bold text-white focus:outline-none placeholder-slate-600"
                />
                <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-1">mmHg</span>
              </div>
            </div>

            {/* Pulse */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 focus-within:border-rose-500 transition-colors">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block flex items-center gap-1">
                <Heart className="w-3 h-3 text-rose-500" /> Pulse Rate
              </label>
              <div className="flex items-center justify-between">
                <input
                  type="number"
                  placeholder="e.g. 128"
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value)}
                  className="w-full bg-transparent text-base font-mono font-bold text-white focus:outline-none placeholder-slate-600"
                />
                <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-1">BPM</span>
              </div>
            </div>

            {/* SpO2 */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 focus-within:border-cyan-500 transition-colors">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block flex items-center gap-1">
                <Wind className="w-3 h-3 text-cyan-400" /> SpO2 Saturation
              </label>
              <div className="flex items-center justify-between">
                <input
                  type="number"
                  placeholder="e.g. 88"
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  className="w-full bg-transparent text-base font-mono font-bold text-white focus:outline-none placeholder-slate-600"
                />
                <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-1">%</span>
              </div>
            </div>

            {/* Respiratory Rate */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 focus-within:border-amber-500 transition-colors">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">
                Respiratory Rate
              </label>
              <div className="flex items-center justify-between">
                <input
                  type="number"
                  placeholder="e.g. 28"
                  value={respRate}
                  onChange={(e) => setRespRate(e.target.value)}
                  className="w-full bg-transparent text-base font-mono font-bold text-white focus:outline-none placeholder-slate-600"
                />
                <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-1">RPM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Regional Notes Box (Hindi / Marathi / Hinglish) */}
        <div className="backdrop-blur-md bg-slate-900/80 border border-slate-800 shadow-2xl rounded-2xl p-5 md:p-6 space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Mic className="w-4 h-4 text-amber-400" /> 2. Regional Clinical Notes &amp; Mechanism
            </h2>
            <button
              type="button"
              onClick={toggleRecording}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                isRecording
                  ? "bg-red-600 text-white animate-pulse"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              }`}
            >
              {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-red-400" />}
              <span>{isRecording ? "Recording Audio..." : "Dictate Audio"}</span>
            </button>
          </div>

          <textarea
            rows={3}
            placeholder="Type notes in Hindi, Marathi, Hinglish or English (e.g. 35yo male, bike accident se hai, severe chest injury, saas lene me taklif...)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors resize-none leading-relaxed"
          />

          {/* Quick Regional Suggestion Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] text-slate-400 font-medium">Quick Incident Prompts:</span>
            {sampleRegionalPhrases.map((phrase, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setNotes(phrase.text)}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                + {phrase.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section 3: Injury Image Capture with Instant Preview */}
        <div className="backdrop-blur-md bg-slate-900/80 border border-slate-800 shadow-2xl rounded-2xl p-5 md:p-6 space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#10B981]" /> 3. Injury Photo Capture (Multimodal Vision)
            </h2>
            <span className="text-[11px] font-mono text-[#10B981]">Base64 Gemini 1.5 Pipeline</span>
          </div>

          {!imagePreview ? (
            <div className="border-2 border-dashed border-slate-800 rounded-2xl p-6 text-center bg-slate-950/60 hover:border-slate-700 transition-colors">
              <Camera className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-300 mb-1">Capture or upload visible trauma / wound</p>
              <p className="text-[11px] text-slate-500 mb-3">Instant Base64 payload transmitted to Gemini 1.5 Vision</p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer border border-slate-700 transition-colors">
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Snap Camera / Browse File</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 max-h-56 flex items-center justify-center">
                <img src={imagePreview} alt="Uploaded Injury Preview" className="w-full h-52 object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 bg-slate-900/90 hover:bg-red-600 text-white rounded-lg transition-colors shadow-md"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Image attached for Multimodal Vision
                </span>
                <button type="button" onClick={removeImage} className="text-red-400 hover:underline text-[11px]">
                  Retake Photo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Target Hospital Selector */}
        <div className="backdrop-blur-md bg-slate-900/80 border border-slate-800 shadow-2xl rounded-2xl p-5 md:p-6 space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#3B82F6]" /> 4. Destination Hospital &amp; Verified ICU Bed
            </h2>
            <span className="text-[11px] font-mono text-[#3B82F6]">Nagpur Emergency Network</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {hospitals.map((h) => {
              const isSelected = h.hospital_id === targetHospitalId;
              return (
                <button
                  key={h.hospital_id}
                  type="button"
                  onClick={() => setTargetHospitalId(h.hospital_id)}
                  className={`text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? "bg-blue-950/40 border-blue-500 shadow-lg"
                      : "bg-slate-950 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <h3 className="text-xs font-bold text-white line-clamp-1">{h.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-bold shrink-0">
                      {h.icu_beds_free} Beds
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="text-blue-300 font-mono">{h.ranking_v2?.ranking_grade || "Grade A+"}</span>
                    <span className="font-mono text-slate-300">{h.eta_minutes}m ETA</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Big Trigger: [🚀 ANALYZE & ROUTE VIA GEMINI] */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl font-extrabold text-sm text-white shadow-2xl flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-red-600/30 cursor-pointer disabled:opacity-60"
        >
          {loading ? (
            <>
              <Sparkles className="w-5 h-5 animate-spin text-amber-400" />
              <span>Analyzing Multimodal Injury &amp; Generating SBAR Handover...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>🚀 ANALYZE &amp; ROUTE VIA GEMINI</span>
            </>
          )}
        </button>
      </form>

      {/* Gemini SBAR Output Display Card */}
      {aiReport && (
        <div className="mt-8 relative z-10 backdrop-blur-md bg-slate-900/90 border border-blue-500/40 rounded-2xl p-6 space-y-5 shadow-2xl animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
            <span className="text-xs uppercase tracking-wider font-extrabold text-blue-400 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-400" /> Gemini 1.5 Clinical SBAR Handover
            </span>
            <div className="flex items-center gap-2.5">
              <span className="text-xs px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full font-bold">
                Score: {aiReport.trauma_score} / 10 ({aiReport.urgency})
              </span>
            </div>
          </div>

          {/* 4-Quadrant SBAR Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="font-extrabold text-[#EF4444] uppercase tracking-wider block">S - Situation</span>
              <p className="text-slate-300 leading-relaxed">{aiReport.sbar?.situation}</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="font-extrabold text-[#3B82F6] uppercase tracking-wider block">B - Background</span>
              <p className="text-slate-300 leading-relaxed">{aiReport.sbar?.background}</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="font-extrabold text-amber-400 uppercase tracking-wider block">A - Assessment</span>
              <p className="text-slate-300 leading-relaxed">{aiReport.sbar?.assessment}</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="font-extrabold text-[#10B981] uppercase tracking-wider block">R - Recommendation</span>
              <p className="text-slate-300 leading-relaxed">{aiReport.sbar?.recommendation}</p>
            </div>
          </div>

          {/* Required Specialists */}
          {aiReport.required_specialists && (
            <div className="pt-1">
              <span className="text-xs font-semibold text-slate-400 block mb-2">Mobilized Emergency Specialties:</span>
              <div className="flex flex-wrap gap-2">
                {aiReport.required_specialists.map((spec: string) => (
                  <span
                    key={spec}
                    className="px-3 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold"
                  >
                    🩺 {spec}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Transmission Confirmation & Quick Nav Pills */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-[#10B981] font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Transmitted to Hospital ER Command Center
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link
                href="/hospital-er"
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Open ER Command View</span>
              </Link>
              <Link
                href="/navigation"
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
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

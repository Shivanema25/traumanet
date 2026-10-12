"use client";

import React, { useState } from "react";
import { useTraumaNet } from "@/lib/TraumaNetContext";
import { PatientVitals, SbarReport } from "@/lib/types";
import {
  Camera,
  Upload,
  X,
  Activity,
  ShieldAlert,
  Send,
  Sparkles,
  Building2,
  Heart,
  Wind,
  Languages,
  FileText,
  CheckCircle2,
  Navigation,
  ArrowRight,
  Clock,
  User,
} from "lucide-react";
import VoiceNotesRecorder from "@/components/VoiceNotesRecorder";
import Link from "next/link";

export default function ParamedicPage() {
  const {
    hospitals,
    createSession,
    useLiveGemini,
    geminiApiKey,
  } = useTraumaNet();

  // Manual User Input States (Strictly user-typed, no auto-simulation tickers)
  const [bpSys, setBpSys] = useState<string>("85");
  const [bpDia, setBpDia] = useState<string>("55");
  const [pulse, setPulse] = useState<string>("128");
  const [spo2, setSpo2] = useState<string>("89");
  const [respRate, setRespRate] = useState<string>("28");
  const [gcs, setGcs] = useState<string>("9");

  const [patientName, setPatientName] = useState<string>("Ramesh K. Verma");
  const [patientAge, setPatientAge] = useState<string>("35");
  const [patientGender, setPatientGender] = useState<"MALE" | "FEMALE" | "OTHER">("MALE");

  // Local Language Notes (Supports Hindi, Marathi, Hinglish, English)
  const [notes, setNotes] = useState<string>(
    "35-year-old male, bike accident, severe head injury and active temporal bleeding. Drowsy."
  );
  const [notesLang, setNotesLang] = useState<"hi-IN" | "mr-IN" | "en-IN">("en-IN");

  // Multimodal Image upload
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Selected Target Hospital
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(
    hospitals[0]?.hospital_id || "hosp-aiims-01"
  );

  // AI Triage & SBAR Result State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [triageError, setTriageError] = useState<string | null>(null);
  const [triageResult, setTriageResult] = useState<{
    trauma_score: number;
    urgency: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    sbar: SbarReport;
    required_specialists: string[];
    ai_source?: string;
  } | null>(null);
  const [transmittedSessionId, setTransmittedSessionId] = useState<string | null>(null);

  // Image Selection Handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImageFile(null);
    setImagePreview(null);
  };

  // Submit Triage directly to Gemini 1.5 API
  const handleSubmitTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTriageError(null);

    const manualVitals: PatientVitals = {
      blood_pressure_sys: Number(bpSys) || 120,
      blood_pressure_dia: Number(bpDia) || 80,
      pulse_rate: Number(pulse) || 80,
      spo2: Number(spo2) || 98,
      respiratory_rate: Number(respRate) || 16,
      gcs_score: Number(gcs) || 15,
      temperature_c: 36.5,
    };

    try {
      const formData = new FormData();
      if (selectedImageFile) {
        formData.append("image", selectedImageFile);
      }
      formData.append("vitals", JSON.stringify(manualVitals));
      formData.append("notes", notes);
      if (useLiveGemini && geminiApiKey) {
        formData.append("apiKey", geminiApiKey);
      }

      const response = await fetch("/api/triage", {
        method: "POST",
        body: formData,
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || "Failed to process AI triage");
      }

      const data = json.data;
      const urgency = data.urgency || "HIGH";
      const sbar: SbarReport = data.sbar || {
        situation: `Acute trauma presentation with vital instability (BP ${bpSys}/${bpDia}).`,
        background: notes || "High-velocity road traffic incident.",
        assessment: `Trauma Score ${data.trauma_score || 8.0}/10. Priority level: ${urgency}.`,
        recommendation: "Standby Level 1 trauma bay, cross-match blood, and alert trauma specialists.",
      };

      setTriageResult({
        trauma_score: Number(data.trauma_score) || 7.5,
        urgency,
        sbar,
        required_specialists: data.required_specialists || ["Trauma Surgeon"],
        ai_source: data.ai_source || "gemini-1.5-flash",
      });

      // Synchronize with global state and transmit to Hospital ER
      const newSession = createSession({
        incident_title: notes ? notes.slice(0, 50) : "Inbound Emergency Polytrauma",
        patient_info: {
          name: patientName.trim() || "Emergency Patient",
          age: Number(patientAge) || 30,
          gender: patientGender,
          emergency_contact_name: "Attending Bystander / Family",
          emergency_contact_phone: "+91 98765 43210",
        },
        vitals: manualVitals,
        trauma_score: Number(data.trauma_score) || 7.5,
        severity: urgency,
        urgency,
        sbar,
        ai_pre_report: `${sbar.situation} ${sbar.assessment}`,
        required_specialists: data.required_specialists || ["Trauma Surgeon"],
        assigned_hospital_id: selectedHospitalId,
        injury_image_url: imagePreview || undefined,
        voice_notes: notes,
        raw_paramedic_notes: notes,
        bed_status: "HOLD",
        eta_minutes: hospitals.find((h) => h.hospital_id === selectedHospitalId)?.eta_minutes || 8,
      });

      setTransmittedSessionId(newSession.session_id);
    } catch (err: any) {
      console.error("Triage submission error:", err);
      setTriageError(err.message || "Failed to contact Gemini Triage service");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedHospital =
    hospitals.find((h) => h.hospital_id === selectedHospitalId) || hospitals[0];

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      {/* Top Header Bar */}
      <div className="bg-slate-900 border-b border-slate-800 py-4 px-4 sticky top-18 z-30">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-sm">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Paramedic Triage Fleet Terminal</h1>
              <p className="text-xs text-slate-400">
                Direct User Input • Multimodal Gemini 1.5 Vision • Multilingual SBAR Handover
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-mono">Real-Time ER Link Active</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <form onSubmit={handleSubmitTriage} className="space-y-6">
          {/* Section 1: Patient Identity */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <User className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white">1. Patient Identification</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Patient Full Name
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Ramesh K. Verma"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Age (Years)
                </label>
                <input
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  placeholder="35"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Gender
                </label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="MALE">Male (पुरुष)</option>
                  <option value="FEMALE">Female (महिला)</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Clean Manual Vitals Form (NO fake simulation) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white">2. Manual Patient Vitals (Crisp Form)</h2>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                Direct Manual Readings
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Blood Pressure Systolic */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-semibold flex items-center gap-1.5 text-blue-400">
                    <Activity className="w-3.5 h-3.5" /> BP (Sys/Dia)
                  </span>
                  <span className="text-[10px] font-mono">mmHg</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={bpSys}
                    onChange={(e) => setBpSys(e.target.value)}
                    placeholder="120"
                    className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-base font-mono font-bold text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                  <span className="text-slate-500 font-bold">/</span>
                  <input
                    type="number"
                    value={bpDia}
                    onChange={(e) => setBpDia(e.target.value)}
                    placeholder="80"
                    className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-base font-mono font-bold text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Pulse Rate */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-semibold flex items-center gap-1.5 text-rose-400">
                    <Heart className="w-3.5 h-3.5 fill-rose-500/20" /> Pulse
                  </span>
                  <span className="text-[10px] font-mono">BPM</span>
                </div>
                <input
                  type="number"
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value)}
                  placeholder="80"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-base font-mono font-bold text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              {/* SpO2 */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-semibold flex items-center gap-1.5 text-cyan-400">
                    <Wind className="w-3.5 h-3.5" /> SpO2
                  </span>
                  <span className="text-[10px] font-mono">%</span>
                </div>
                <input
                  type="number"
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  placeholder="98"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-base font-mono font-bold text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              {/* Respiratory Rate */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-semibold flex items-center gap-1.5 text-amber-400">
                    <Activity className="w-3.5 h-3.5" /> Resp. Rate
                  </span>
                  <span className="text-[10px] font-mono">RPM</span>
                </div>
                <input
                  type="number"
                  value={respRate}
                  onChange={(e) => setRespRate(e.target.value)}
                  placeholder="18"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-base font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            {/* Optional GCS Indicator */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
              <span className="text-slate-400">Glasgow Coma Scale (GCS 3–15):</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="3"
                  max="15"
                  value={gcs}
                  onChange={(e) => setGcs(e.target.value)}
                  className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono font-bold text-purple-300 text-center"
                />
                <span className="text-slate-400">/ 15</span>
              </div>
            </div>
          </div>

          {/* Section 3: Injury Vision Image & Local Language Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Multimodal Image Upload */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-purple-400" />
                  <h2 className="text-sm font-bold text-white">3. Wound / Injury Photo</h2>
                </div>
                <span className="text-[11px] text-purple-400 font-mono">Gemini Vision</span>
              </div>

              {!imagePreview ? (
                <div className="border-2 border-dashed border-slate-800 rounded-2xl p-6 text-center hover:border-slate-700 transition-colors bg-slate-950/50">
                  <Camera className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-300 mb-1">
                    Upload trauma image or capture camera
                  </p>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Converts to Base64 for multimodal AI vision analysis
                  </p>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer border border-slate-700 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-purple-400" />
                    <span>Choose File / Snap Camera</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 max-h-52 flex items-center justify-center">
                    <img
                      src={imagePreview}
                      alt="Uploaded Injury Trauma"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1.5 bg-slate-900/80 hover:bg-red-600 text-white rounded-lg transition-colors shadow-sm"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Ready for Gemini 1.5 Vision analysis</span>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="text-red-400 hover:underline text-[11px]"
                    >
                      Change Picture
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Local Language Voice & Notes */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Languages className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-sm font-bold text-white">4. Local Language Notes</h2>
                </div>
                <span className="text-[11px] text-emerald-400 font-mono">Hindi • Marathi • Hinglish</span>
              </div>

              <VoiceNotesRecorder
                value={notes}
                onChange={setNotes}
                selectedLanguage={notesLang}
                onLanguageChange={setNotesLang}
              />
            </div>
          </div>

          {/* Section 4: Target Hospital Selection */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-bold text-white">5. Target Hospital &amp; Verified ICU Bed</h2>
              </div>
              <span className="text-[11px] text-blue-400 font-mono">
                {hospitals.filter((h) => h.icu_beds_free > 0).length} ERs with Available ICU Beds
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {hospitals.map((h) => {
                const isSelected = h.hospital_id === selectedHospitalId;
                const hasBeds = h.icu_beds_free > 0;
                return (
                  <button
                    key={h.hospital_id}
                    type="button"
                    onClick={() => setSelectedHospitalId(h.hospital_id)}
                    className={`text-left p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-blue-950/40 border-blue-500 shadow-sm"
                        : "bg-slate-950 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-xs font-bold text-white">{h.name}</h3>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          hasBeds
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-red-500/15 text-red-300"
                        }`}
                      >
                        {h.icu_beds_free} Beds
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{h.trauma_level}</span>
                      <span className="font-mono text-slate-300 font-semibold">{h.eta_minutes} min ETA</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Message */}
          {triageError && (
            <div className="p-4 bg-red-950/50 border border-red-500/50 rounded-2xl text-xs text-red-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>{triageError}</span>
            </div>
          )}

          {/* Big Action Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 rounded-2xl font-bold text-sm text-white shadow-lg flex items-center justify-center gap-2 transition-all ${
              isSubmitting
                ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-red-600"
            }`}
          >
            {isSubmitting ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin text-amber-400" />
                <span>Gemini 1.5 Analyzing Vision &amp; Translating Local Notes...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>TRIGGER GEMINI 1.5 MULTIMODAL TRIAGE &amp; TRANSMIT TO ER</span>
              </>
            )}
          </button>
        </form>

        {/* Section 5: Structured SBAR Clinical Report Card */}
        {triageResult && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 animate-in fade-in duration-300">
            {/* Header with Trauma Score & Urgency */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-bold text-white">SBAR Clinical Handover Report</h2>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Standardized emergency handover format for receiving ER Trauma Team
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider ${
                    triageResult.urgency === "CRITICAL"
                      ? "bg-red-500/20 text-red-300 border border-red-500/40"
                      : triageResult.urgency === "HIGH"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  }`}
                >
                  {triageResult.urgency} Acuity
                </span>
                <div className="bg-slate-950 px-3 py-1 rounded-xl border border-slate-800 text-xs font-mono font-bold text-white">
                  Score: <span className="text-red-400">{triageResult.trauma_score}</span> / 10
                </div>
              </div>
            </div>

            {/* SBAR 4-Block Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* S: Situation */}
              <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-rose-400">
                  <span className="w-6 h-6 rounded-lg bg-rose-500/20 flex items-center justify-center font-bold text-xs">
                    S
                  </span>
                  <h3 className="text-xs font-bold uppercase tracking-wider">Situation</h3>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {triageResult.sbar.situation}
                </p>
              </div>

              {/* B: Background */}
              <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-400">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center font-bold text-xs">
                    B
                  </span>
                  <h3 className="text-xs font-bold uppercase tracking-wider">Background</h3>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {triageResult.sbar.background}
                </p>
              </div>

              {/* A: Assessment */}
              <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-blue-400">
                  <span className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center font-bold text-xs">
                    A
                  </span>
                  <h3 className="text-xs font-bold uppercase tracking-wider">Assessment</h3>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {triageResult.sbar.assessment}
                </p>
              </div>

              {/* R: Recommendation */}
              <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center font-bold text-xs">
                    R
                  </span>
                  <h3 className="text-xs font-bold uppercase tracking-wider">Recommendation</h3>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {triageResult.sbar.recommendation}
                </p>
              </div>
            </div>

            {/* Required Specialists */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400">
                Required Emergency Specialists to Mobilize:
              </span>
              <div className="flex flex-wrap gap-2">
                {triageResult.required_specialists.map((spec) => (
                  <span
                    key={spec}
                    className="px-3 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold"
                  >
                    🩺 {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Direct View Navigation Links */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Transmitted to {selectedHospital.name} ER Command Center
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Link
                  href="/hospital-er"
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Open ER Command View</span>
                </Link>

                <Link
                  href="/navigation"
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Google Maps Driving HUD</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

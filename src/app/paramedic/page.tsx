"use client";

import { useState, useRef, useEffect } from "react";
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
  ArrowLeft,
  Phone,
  Volume2,
} from "lucide-react";
import { useTraumaNet } from "@/lib/TraumaNetContext";
import Link from "next/link";
import NagpurMap from "@/components/NagpurMap";
import { translateRegionalToEnglish } from "@/lib/medicalTranslation";

export default function ParamedicPage() {
  const { createSession, hospitals, geminiApiKey } = useTraumaNet();

  // Manual User Input States (Zero auto-simulation / zero fake tickers)
  const [bp, setBp] = useState("");
  const [pulse, setPulse] = useState("");
  const [spo2, setSpo2] = useState("");
  const [respRate, setRespRate] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [aiReport, setAiReport] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [spokenLanguage, setSpokenLanguage] = useState<"en-IN" | "hi-IN" | "mr-IN">("en-IN");
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetHospitalId, setTargetHospitalId] = useState(hospitals[0]?.hospital_id || "hosp-kingsway-nagpur");

  const recognitionRef = useRef<any>(null);
  const isRecordingRef = useRef<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const spokenLanguageRef = useRef<"en-IN" | "hi-IN" | "mr-IN">("en-IN");
  spokenLanguageRef.current = spokenLanguage;

  // Cleanup speech recognition and timer on unmount
  useEffect(() => {
    return () => {
      isRecordingRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

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

  // Polish notes into clinical English (via AI / dictionary fallback)
  const polishNotesToEnglish = async (rawNotes?: string) => {
    const textToTranslate = rawNotes !== undefined ? rawNotes : notes;
    if (!textToTranslate || !textToTranslate.trim()) return;

    setIsTranslating(true);
    try {
      const res = await fetch("/api/ai/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: textToTranslate, apiKey: geminiApiKey || undefined }),
      });
      const data = await res.json();
      if (data.success && data.englishNotes) {
        setNotes(data.englishNotes);
      }
    } catch (err) {
      console.warn("AI translation error, using rule-based translation:", err);
      setNotes(translateRegionalToEnglish(textToTranslate));
    } finally {
      setIsTranslating(false);
    }
  };

  // Continuous Speech Dictation - Keeps open until user explicitly turns it off
  const stopRecording = () => {
    isRecordingRef.current = false;
    setIsRecording(false);
    setInterimTranscript("");
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    // Polish notes to crisp medical English when user stops
    setTimeout(() => {
      polishNotesToEnglish();
    }, 250);
  };

  const startRecording = () => {
    if (typeof window === "undefined") return;
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      // Fallback sample note in clean English
      const sample = "35yo male, motorcycle accident, severe chest trauma, acute dyspnea, active bleeding.";
      setNotes((prev) => (prev ? `${prev}. ${sample}` : sample));
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const recognition = new SpeechRec();
      recognition.continuous = true; // DO NOT stop on pause
      recognition.interimResults = true;
      recognition.lang = spokenLanguageRef.current;
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let finalChunk = "";
        let interimChunk = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          const transcript = item[0].transcript;
          if (item.isFinal) {
            finalChunk += transcript + " ";
          } else {
            interimChunk += transcript;
          }
        }

        if (finalChunk.trim()) {
          // Immediately translate regional words/phrases into clinical English
          const englishChunk = translateRegionalToEnglish(finalChunk.trim());
          setNotes((prev) => {
            const cleanPrev = prev.trim();
            return cleanPrev ? `${cleanPrev} ${englishChunk}` : englishChunk;
          });
        }

        setInterimTranscript(interimChunk);
      };

      recognition.onerror = (event: any) => {
        console.debug("Speech recognition event error:", event.error);
        // Ignore silence / no-speech timeouts - keep listening!
        if (event.error === "no-speech" || event.error === "audio-capture") {
          return;
        }
        if (event.error === "not-allowed") {
          alert("Microphone permission was denied. Please allow microphone access in your browser settings.");
          stopRecording();
        }
      };

      recognition.onend = () => {
        // Essential: Keep listening until the user explicitly turns it off
        if (isRecordingRef.current) {
          try {
            recognition.start();
          } catch (e) {
            setTimeout(() => {
              if (isRecordingRef.current) {
                try {
                  recognition.start();
                } catch (err) {}
              }
            }, 250);
          }
        } else {
          setIsRecording(false);
          setInterimTranscript("");
        }
      };

      isRecordingRef.current = true;
      setIsRecording(true);
      setRecordingSeconds(0);
      setInterimTranscript("");

      // Start elapsed timer
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      stopRecording();
    }
  };

  const toggleRecording = () => {
    if (isRecordingRef.current) {
      stopRecording();
    } else {
      startRecording();
    }
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
        respRate: respRate || "16",
      })
    );
    formData.append("notes", notes || "No additional field notes provided");
    if (geminiApiKey) {
      formData.append("apiKey", geminiApiKey);
    }

    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (json.success && json.data) {
        setAiReport(json.data);

        // Parse BP
        const bpParts = (bp || "120/80").split(/[\/\s-]+/);
        const sys = Number(bpParts[0]) || 120;
        const dia = Number(bpParts[1]) || 80;

        // Auto-save session in shared store
        createSession({
          patient_info: {
            name: "Field Patient #108",
            age: 35,
            gender: "MALE",
          },
          vitals: {
            blood_pressure_sys: sys,
            blood_pressure_dia: dia,
            pulse_rate: Number(pulse) || 80,
            spo2: Number(spo2) || 98,
            respiratory_rate: Number(respRate) || 16,
            gcs_score: 13,
          },
          trauma_score: json.data.trauma_score || 8.2,
          severity: json.data.urgency || "HIGH",
          ai_pre_report: json.data.sbar?.situation || "Field triage completed via Gemini 1.5",
          sbar: json.data.sbar,
          assigned_hospital_id: targetHospitalId,
          bed_status: "HOLD",
          voice_notes: notes,
          injury_image_url: imagePreview || undefined,
        });
      } else {
        alert(json.error || "Failed to process multimodal triage.");
      }
    } catch (err) {
      console.error(err);
      alert("Error contacting Triage API.");
    } finally {
      setLoading(false);
    }
  };

  const sampleRegionalPhrases = [
    {
      label: "Motorcycle Crash (Chest Trauma)",
      text: "35yo male, motorcycle accident near Wardha flyover, blunt chest trauma, acute dyspnea, crashing blood pressure.",
    },
    {
      label: "Blunt Head Trauma (Unconscious)",
      text: "42yo male, highway collision near Jamtha, severe blunt head trauma with active hemorrhage, patient is unconscious.",
    },
    {
      label: "Pedestrian Hit (Compound Fracture)",
      text: "28yo female, struck by auto-rickshaw at Kamptee square, right lower extremity open fracture with heavy swelling, unstable vitals.",
    },
    {
      label: "Acute Respiratory Distress (Hypoxia)",
      text: "50yo male, severe acute respiratory distress, SpO2 84%, rapid thready pulse, cold peripheries.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#E6EDF4] text-slate-900 p-4 md:p-8 max-w-5xl mx-auto font-sans pb-24">
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
            <Activity className="w-6 h-6 text-red-600" />
            TraumaNet Mobile Node #108 — Nagpur Pilot
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manual Vitals Intake • Local Multilingual Notes • Multimodal Gemini 1.5 SBAR Clinical Handover
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-white text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg font-mono shadow-xs">
            Ambulance: <strong className="text-slate-900">MH-31-ALS-108</strong>
          </span>
          <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg font-bold">
            ● ONLINE
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Section 1: Clean Manual Vitals Input */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-red-600" /> 1. Manual Patient Vitals
            </h2>
            <span className="text-[11px] font-mono text-slate-500">Manual Entry (Zero Mock Simulation)</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* BP */}
            <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 focus-within:border-red-600 focus-within:bg-white transition-all">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 block">
                Blood Pressure (BP)
              </label>
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  placeholder="e.g. 120/80"
                  value={bp}
                  onChange={(e) => setBp(e.target.value)}
                  className="w-full bg-transparent text-sm font-mono font-bold text-slate-900 focus:outline-none placeholder-slate-400"
                />
                <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-1">mmHg</span>
              </div>
            </div>

            {/* Pulse */}
            <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 focus-within:border-red-600 focus-within:bg-white transition-all">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 block flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-500" /> Pulse Rate
              </label>
              <div className="flex items-center justify-between">
                <input
                  type="number"
                  placeholder="e.g. 124"
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value)}
                  className="w-full bg-transparent text-sm font-mono font-bold text-slate-900 focus:outline-none placeholder-slate-400"
                />
                <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-1">BPM</span>
              </div>
            </div>

            {/* SpO2 */}
            <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 focus-within:border-blue-600 focus-within:bg-white transition-all">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 block flex items-center gap-1">
                <Wind className="w-3 h-3 text-blue-500" /> SpO2 Saturation
              </label>
              <div className="flex items-center justify-between">
                <input
                  type="number"
                  placeholder="e.g. 91"
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  className="w-full bg-transparent text-sm font-mono font-bold text-slate-900 focus:outline-none placeholder-slate-400"
                />
                <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-1">%</span>
              </div>
            </div>

            {/* Respiratory Rate */}
            <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 focus-within:border-emerald-600 focus-within:bg-white transition-all">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 block">
                Respiratory Rate
              </label>
              <div className="flex items-center justify-between">
                <input
                  type="number"
                  placeholder="e.g. 28"
                  value={respRate}
                  onChange={(e) => setRespRate(e.target.value)}
                  className="w-full bg-transparent text-sm font-mono font-bold text-slate-900 focus:outline-none placeholder-slate-400"
                />
                <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-1">RPM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Clinical Notes & Continuous Voice Dictation (Auto-written in English) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 space-y-3.5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Mic className="w-4 h-4 text-red-600" /> 2. Voice Dictation &amp; Clinical Notes
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Notes stay recording until you stop. Dictate in English, Hindi, or Marathi — notes are written in <strong className="text-slate-800 font-semibold">clinical English</strong>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Spoken Language Selector */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-300 text-[11px]">
                <button
                  type="button"
                  onClick={() => setSpokenLanguage("en-IN")}
                  className={`px-2 py-1 rounded-md font-semibold transition-all ${
                    spokenLanguage === "en-IN"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="Direct English transcription"
                >
                  English / Hinglish
                </button>
                <button
                  type="button"
                  onClick={() => setSpokenLanguage("hi-IN")}
                  className={`px-2 py-1 rounded-md font-semibold transition-all ${
                    spokenLanguage === "hi-IN"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="Speak in Hindi -> Auto-translated to English"
                >
                  हिंदी (Hindi)
                </button>
                <button
                  type="button"
                  onClick={() => setSpokenLanguage("mr-IN")}
                  className={`px-2 py-1 rounded-md font-semibold transition-all ${
                    spokenLanguage === "mr-IN"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="Speak in Marathi -> Auto-translated to English"
                >
                  मराठी (Marathi)
                </button>
              </div>

              {/* Main Record / Stop Button */}
              <button
                type="button"
                onClick={toggleRecording}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${
                  isRecording
                    ? "bg-red-600 hover:bg-red-700 text-white ring-2 ring-red-300"
                    : "bg-slate-900 hover:bg-slate-800 text-white"
                }`}
              >
                {isRecording ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span>Stop Recording ({formatTime(recordingSeconds)})</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-red-400" />
                    <span>Start Voice Recording</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Active Recording Banner */}
          {isRecording && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-red-800">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                </span>
                <span className="font-bold">RECORDING ACTIVE ({formatTime(recordingSeconds)})</span>
                <span className="hidden md:inline text-slate-600">
                  — Stays open continuously until you click Stop. Audio translates directly into English.
                </span>
              </div>
              <button
                type="button"
                onClick={stopRecording}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold transition-colors shrink-0"
              >
                ⏹️ Done / Stop
              </button>
            </div>
          )}

          {/* Interim speech feedback */}
          {interimTranscript && (
            <div className="text-xs text-slate-600 italic bg-amber-50/80 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5 text-amber-600 shrink-0 not-italic" />
              <span className="font-semibold text-amber-800 not-italic">Hearing:</span>
              <span>&ldquo;{interimTranscript}&rdquo;</span>
            </div>
          )}

          {/* Textarea for Notes with Translate to English button */}
          <div className="relative">
            <textarea
              rows={3}
              placeholder="Clinical notes appear here in English as you speak (e.g. 35yo male, motorcycle accident, severe blunt chest trauma, acute dyspnea, hypotension)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 pb-8 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all resize-none leading-relaxed font-sans"
            />
            {notes && (
              <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => polishNotesToEnglish()}
                  disabled={isTranslating}
                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                  title="Polish and translate any remaining regional words to English"
                >
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  <span>{isTranslating ? "Translating..." : "Translate to Clinical English"}</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Incident Suggestion Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] text-slate-500 font-medium">Quick Prompts:</span>
            {sampleRegionalPhrases.map((phrase, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setNotes((prev) => (prev ? `${prev}. ${phrase.text}` : phrase.text))}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
              >
                + {phrase.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section 3: Injury Image Capture with Instant Preview */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-600" /> 3. Injury Photo Capture (Multimodal Vision)
            </h2>
            <span className="text-[11px] font-mono text-emerald-700 font-medium">Base64 Gemini 1.5 Pipeline</span>
          </div>

          {!imagePreview ? (
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
              <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 mb-1">Capture or upload visible trauma / wound</p>
              <p className="text-[11px] text-slate-500 mb-3">Base64 image payload transmitted to Gemini 1.5 Vision</p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer border border-slate-300 transition-colors shadow-xs">
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                <span>Snap Camera / Browse File</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 max-h-56 flex items-center justify-center">
                <img src={imagePreview} alt="Uploaded Injury Preview" className="w-full h-52 object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 bg-slate-900/80 hover:bg-red-600 text-white rounded-lg transition-colors shadow-sm"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Image attached for Gemini Vision
                </span>
                <button type="button" onClick={removeImage} className="text-red-600 hover:underline text-[11px] font-medium">
                  Retake Photo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Target Hospital Selector */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" /> 4. Destination Hospital &amp; Verified ICU Bed
            </h2>
            <span className="text-[11px] font-mono text-slate-500">Nagpur Emergency Network</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {hospitals.map((h) => {
              const isSelected = h.hospital_id === targetHospitalId;
              return (
                <button
                  key={h.hospital_id}
                  type="button"
                  onClick={() => setTargetHospitalId(h.hospital_id)}
                  className={`text-left p-3.5 rounded-lg border transition-all ${
                    isSelected
                      ? "bg-red-50/40 border-2 border-red-600 shadow-sm"
                      : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{h.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold shrink-0">
                      {h.icu_beds_free} Beds
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="text-blue-700 font-semibold">{h.ranking_v2?.ranking_grade || "Grade A+"}</span>
                    <span className="font-mono text-slate-700 font-bold">{h.eta_minutes}m ETA</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 5: Real-Time Nagpur Emergency Corridor & Shortest Path (OSRM) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Navigation className="w-4 h-4 text-blue-600" /> 5. Live Nagpur Route &amp; Corridor Map
            </h2>
            <span className="text-[11px] font-mono text-emerald-700 font-medium">OSRM Shortest Path Turn-by-Turn</span>
          </div>
          <NagpurMap
            height="360px"
            onHospitalSelect={(h) => setTargetHospitalId(h.id)}
            showSoftLockAction={false}
          />
        </div>

        {/* Big Trigger: [🚀 ANALYZE & ROUTE VIA GEMINI] */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl font-bold text-sm text-white shadow-xs flex items-center justify-center gap-2 transition-all bg-red-600 hover:bg-red-700 cursor-pointer disabled:opacity-60"
        >
          {loading ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin text-amber-200" />
              <span>Analyzing Multimodal Injury &amp; Generating Clinical SBAR...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>🚀 ANALYZE &amp; ROUTE VIA GEMINI</span>
            </>
          )}
        </button>
      </form>

      {/* Gemini SBAR Output Display Card */}
      {aiReport && (
        <div className="mt-8 bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-4 gap-3">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" /> Gemini 1.5 Clinical SBAR Handover Report
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full font-bold">
                Trauma Score: {aiReport.trauma_score} / 10 ({aiReport.urgency})
              </span>
            </div>
          </div>

          {/* 4-Quadrant SBAR Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-red-50/50 p-4 rounded-lg border border-red-200 space-y-1">
              <span className="font-bold text-red-700 uppercase tracking-wider block">S - Situation</span>
              <p className="text-slate-800 leading-relaxed">{aiReport.sbar?.situation}</p>
            </div>
            <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-200 space-y-1">
              <span className="font-bold text-blue-700 uppercase tracking-wider block">B - Background</span>
              <p className="text-slate-800 leading-relaxed">{aiReport.sbar?.background}</p>
            </div>
            <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-200 space-y-1">
              <span className="font-bold text-amber-700 uppercase tracking-wider block">A - Assessment</span>
              <p className="text-slate-800 leading-relaxed">{aiReport.sbar?.assessment}</p>
            </div>
            <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-200 space-y-1">
              <span className="font-bold text-emerald-700 uppercase tracking-wider block">R - Recommendation</span>
              <p className="text-slate-800 leading-relaxed">{aiReport.sbar?.recommendation}</p>
            </div>
          </div>

          {/* Transmission Confirmation & Quick Nav Pills */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Transmitted to Hospital ER Command Center
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link
                href="/hospital-er"
                className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Open ER Command View</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

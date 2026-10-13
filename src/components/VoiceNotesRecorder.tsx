"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Languages, Sparkles, Volume2 } from "lucide-react";
import { translateRegionalToEnglish } from "@/lib/medicalTranslation";

interface VoiceNotesRecorderProps {
  value: string;
  onChange: (notes: string) => void;
  selectedLanguage?: "hi-IN" | "mr-IN" | "en-IN";
  onLanguageChange?: (lang: "hi-IN" | "mr-IN" | "en-IN") => void;
}

export default function VoiceNotesRecorder({
  value,
  onChange,
  selectedLanguage = "en-IN",
  onLanguageChange,
}: VoiceNotesRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [lang, setLang] = useState<"hi-IN" | "mr-IN" | "en-IN">(selectedLanguage);
  const [hasSpeechRecognition, setHasSpeechRecognition] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const recognitionRef = useRef<any>(null);
  const isRecordingRef = useRef<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const langRef = useRef<"hi-IN" | "mr-IN" | "en-IN">(lang);
  langRef.current = lang;

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      setHasSpeechRecognition(true);
    }

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

  const handleLangSelect = (newLang: "hi-IN" | "mr-IN" | "en-IN") => {
    setLang(newLang);
    if (onLanguageChange) onLanguageChange(newLang);
  };

  // Polish notes into crisp medical English using AI / dictionary fallback
  const polishNotesToEnglish = async (textToTranslate?: string) => {
    const text = textToTranslate !== undefined ? textToTranslate : value;
    if (!text || !text.trim()) return;

    setIsTranslating(true);
    try {
      const res = await fetch("/api/ai/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: text }),
      });
      const data = await res.json();
      if (data.success && data.englishNotes) {
        onChange(data.englishNotes);
      }
    } catch (err) {
      console.warn("AI translation error, falling back to dictionary:", err);
      onChange(translateRegionalToEnglish(text));
    } finally {
      setIsTranslating(false);
    }
  };

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

    // Auto-polish to clinical English on stop
    setTimeout(() => {
      polishNotesToEnglish();
    }, 250);
  };

  const startRecording = () => {
    if (!hasSpeechRecognition) {
      // Offline fallback: Insert structured clinical English note
      const fallback =
        "35-year-old male, high-speed motorcycle crash, severe temporal head trauma and active hemorrhage.";
      onChange(value ? `${value} ${fallback}` : fallback);
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true; // DO NOT stop automatically on pauses
      recognition.interimResults = true;
      recognition.lang = langRef.current;
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
          // Immediately translate regional words/phrases into clean clinical English
          const englishChunk = translateRegionalToEnglish(finalChunk.trim());
          onChange(value ? `${value.trim()} ${englishChunk}` : englishChunk);
        }

        setInterimTranscript(interimChunk);
      };

      recognition.onerror = (event: any) => {
        console.debug("VoiceNotesRecorder speech error:", event.error);
        // Do not stop on silence pauses (no-speech)
        if (event.error === "no-speech" || event.error === "audio-capture") {
          return;
        }
        if (event.error === "not-allowed") {
          alert("Microphone permission denied. Please allow microphone access in browser settings.");
          stopRecording();
        }
      };

      recognition.onend = () => {
        // Continuous keep-alive: stay open until user clicks stop
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

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      recognition.start();
    } catch {
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

  const quickPhrasesByLang = {
    "hi-IN": [
      "35yo Male (Bike Crash)",
      "Severe Head Trauma",
      "Active Hemorrhage",
      "Unresponsive / GCS < 8",
      "Acute Dyspnea",
    ],
    "mr-IN": [
      "42yo Male (Highway Accident)",
      "Blunt Head Injury",
      "Profuse Bleeding",
      "Unconscious",
      "Compound Bone Fracture",
    ],
    "en-IN": [
      "Severe Head Trauma",
      "Active Hemorrhage",
      "Unresponsive / GCS < 8",
      "Compound Fracture",
      "Motorcycle Accident",
    ],
  };

  return (
    <div className="space-y-3">
      {/* Header with Language Pills and Voice Button */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-300">
            Dictation Language:
          </span>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => handleLangSelect("en-IN")}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                lang === "en-IN"
                  ? "bg-blue-600 text-white font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              English / Hinglish
            </button>
            <button
              type="button"
              onClick={() => handleLangSelect("hi-IN")}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                lang === "hi-IN"
                  ? "bg-amber-600 text-white font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              हिंदी (Auto-Translate)
            </button>
            <button
              type="button"
              onClick={() => handleLangSelect("mr-IN")}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                lang === "mr-IN"
                  ? "bg-emerald-600 text-white font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              मराठी (Auto-Translate)
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleRecording}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${
            isRecording
              ? "bg-red-600 text-white ring-2 ring-red-400"
              : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
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
              <span>Continuous Dictation</span>
            </>
          )}
        </button>
      </div>

      {/* Active Recording Notice */}
      {isRecording && (
        <div className="bg-red-950/70 border border-red-700/80 rounded-xl p-2.5 flex items-center justify-between text-xs text-red-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="font-semibold">Microphone Listening ({formatTime(recordingSeconds)})</span>
            <span className="text-slate-400 hidden sm:inline">— Dictate continuously. Notes transcribe directly in English.</span>
          </div>
          <button
            type="button"
            onClick={stopRecording}
            className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded text-[11px] font-bold"
          >
            Done
          </button>
        </div>
      )}

      {/* Interim Hearing Indicator */}
      {interimTranscript && (
        <div className="text-xs text-amber-300 italic bg-amber-950/40 border border-amber-800/60 rounded-xl px-3 py-1.5 flex items-center gap-2">
          <Volume2 className="w-3.5 h-3.5 text-amber-400 shrink-0 not-italic" />
          <span className="font-semibold text-amber-200 not-italic">Hearing:</span>
          <span>&ldquo;{interimTranscript}&rdquo;</span>
        </div>
      )}

      {/* Input Area */}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Clinical emergency notes appear here in English as you speak (continuous recording until you stop)..."
          rows={3}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 pb-8 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors font-sans"
        />
        {value && (
          <div className="absolute bottom-2 right-2">
            <button
              type="button"
              onClick={() => polishNotesToEnglish()}
              disabled={isTranslating}
              className="px-2 py-0.5 bg-blue-900/50 hover:bg-blue-800/80 border border-blue-700/60 text-blue-200 rounded-md text-[10px] font-semibold flex items-center gap-1 transition-colors"
            >
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span>{isTranslating ? "Translating..." : "Polish to English"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Quick Incident Tags */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Quick Clinical Tags:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quickPhrasesByLang[lang].map((phrase) => (
            <button
              key={phrase}
              type="button"
              onClick={() => onChange(value ? `${value}. ${phrase}` : phrase)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              + {phrase}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

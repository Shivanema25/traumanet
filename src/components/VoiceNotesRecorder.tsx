"use client";

import React, { useState, useEffect } from "react";
import { Mic, MicOff, Languages, Sparkles } from "lucide-react";

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
  const [lang, setLang] = useState<"hi-IN" | "mr-IN" | "en-IN">(selectedLanguage);
  const [hasSpeechRecognition, setHasSpeechRecognition] = useState(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      setHasSpeechRecognition(true);
    }
  }, []);

  const handleLangSelect = (newLang: "hi-IN" | "mr-IN" | "en-IN") => {
    setLang(newLang);
    if (onLanguageChange) onLanguageChange(newLang);
  };

  const toggleRecording = () => {
    if (!hasSpeechRecognition) {
      // Offline fallback mock phrases depending on selected language
      const sampleNotesByLang = {
        "hi-IN": [
          "35 साल का पुरुष, बाइक एक्सीडेंट, सिर में गहरी चोट, काफी खून बह रहा है और मरीज अचेत है।",
          "छाती पर तेज आघात, सांस लेने में अत्यधिक कठिनाई, पल्स कमजोर है।",
          "सड़क दुर्घटना, दाहिने पैर में फ्रैक्चर, बीपी 85/50 तक गिर रहा है।",
        ],
        "mr-IN": [
          "३५ वर्षांचा पुरुष, बाईक अपघात, डोक्याला गंभीर दुखापत, प्रचंड रक्तस्राव आणि बेशुद्ध अवस्था.",
          "छातीवर जबर मार, श्वास घेण्यास अडचण, नाडी मंदावली आहे.",
          "अपघातग्रस्त रुग्ण, उजव्या पायाचे हाड मोडले, रक्तदाब कमी होत आहे.",
        ],
        "en-IN": [
          "35-year-old male, high-speed motorcycle crash, severe temporal head trauma and active hemorrhage.",
          "Blunt chest trauma with flail segment, tachypneic and hypotensive en-route.",
          "Compound lower extremity crush injury, tourniquet placed, BP dropping.",
        ],
      };
      const samples = sampleNotesByLang[lang];
      const randomNote = samples[Math.floor(Math.random() * samples.length)];
      onChange(value ? `${value} ${randomNote}` : randomNote);
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang;

      if (!isRecording) {
        setIsRecording(true);
        recognition.start();

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          onChange(value ? `${value} ${transcript}` : transcript);
          setIsRecording(false);
        };

        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);
      } else {
        recognition.stop();
        setIsRecording(false);
      }
    } catch {
      setIsRecording(false);
    }
  };

  const quickPhrasesByLang = {
    "hi-IN": [
      "सिर में गहरी चोट (Head Trauma)",
      "काफी खून बह रहा है (Hemorrhage)",
      "मरीज बेहोश है (Unconscious)",
      "सांस लेने में तकलीफ (Dyspnea)",
      "बाइक एक्सीडेंट (Bike Crash)",
    ],
    "mr-IN": [
      "डोक्याला गंभीर दुखापत (Head Injury)",
      "प्रचंड रक्तस्राव (Bleeding)",
      "बेशुद्ध रुग्ण (Unconscious)",
      "हाडाचे फ्रॅक्चर (Fracture)",
      "गाडीचा अपघात (Road Accident)",
    ],
    "en-IN": [
      "Severe Head Trauma",
      "Active Hemorrhage",
      "Unresponsive / GCS < 8",
      "Compound Fracture",
      "Bike Accident",
    ],
  };

  return (
    <div className="space-y-3">
      {/* Header with Language Pills and Voice Button */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-300">
            Voice & Notes Language:
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
              Hinglish / EN
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
              हिंदी (Hindi)
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
              मराठी (Marathi)
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleRecording}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
            isRecording
              ? "bg-red-600 text-white animate-pulse"
              : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          }`}
        >
          {isRecording ? (
            <MicOff className="w-3.5 h-3.5" />
          ) : (
            <Mic className="w-3.5 h-3.5 text-red-400" />
          )}
          <span>{isRecording ? "Recording Audio..." : "Dictate Audio"}</span>
        </button>
      </div>

      {/* Input Area */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          lang === "hi-IN"
            ? "यहाँ हिंदी में लिखें या बोलें: उदा. '35 साल का पुरुष, बाइक एक्सीडेंट, सिर में गहरी चोट'..."
            : lang === "mr-IN"
            ? "येथे मराठीत लिहा किंवा बोला: उदा. '३५ वर्षांचा पुरुष, बाईक अपघात, डोक्याला गंभीर दुखापत'..."
            : "Type or dictate clinical notes in Hinglish, Hindi, Marathi, or English (e.g. '35-year-old male, bike accident, severe head injury')..."
        }
        rows={3}
        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors font-sans"
      />

      {/* Local Language Quick Phrase Pills */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Quick Local Language Incident Tags:</span>
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

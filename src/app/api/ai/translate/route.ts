import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { translateRegionalToEnglish } from "@/lib/medicalTranslation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { notes, apiKey: explicitKey } = body;

    if (!notes || typeof notes !== "string" || !notes.trim()) {
      return NextResponse.json({ success: true, englishNotes: "" });
    }

    const key =
      explicitKey ||
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (key && !key.includes("Mock")) {
      try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 250,
          },
        });

        const prompt = `You are a hospital emergency trauma scribe. 
The following field notes were dictated or written by a field paramedic in India (in Hindi, Marathi, Hinglish, or mixed English):
"${notes}"

Task: Convert and translate these notes into clean, concise, professional clinical emergency English for the receiving ER doctor.
- Preserve all patient demographics (age, sex), injury mechanisms, affected anatomy, vitals, and conscious state.
- Output ONLY the final clinical English text. Do not add any greeting, markdown fences, notes, or explanations.`;

        const result = await model.generateContent(prompt);
        const translated = result.response.text().trim();
        if (translated) {
          return NextResponse.json({ success: true, englishNotes: translated });
        }
      } catch (geminiErr) {
        console.warn("Gemini translation error, falling back to rule-based engine:", geminiErr);
      }
    }

    // Fast rule-based medical dictionary fallback
    const fallbackTranslation = translateRegionalToEnglish(notes);
    return NextResponse.json({ success: true, englishNotes: fallbackTranslation });
  } catch (err: any) {
    console.error("Translation route error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Translation failed" },
      { status: 500 }
    );
  }
}

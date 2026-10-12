import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateDeterministicSbarTriage } from "@/lib/gemini";
import { PatientVitals } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let imageFile: File | null = null;
    let imageBase64: string | null = null;
    let notes: string = "";
    let explicitApiKey: string | null = null;

    let parsedVitals: PatientVitals = {
      blood_pressure_sys: 120,
      blood_pressure_dia: 80,
      pulse_rate: 80,
      spo2: 98,
      respiratory_rate: 16,
      gcs_score: 15,
      temperature_c: 37.0,
    };

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      imageFile = formData.get("image") as File | null;
      const vitalsRaw = (formData.get("vitals") as string) || "";
      notes = (formData.get("notes") as string) || "";
      explicitApiKey = (formData.get("apiKey") as string) || null;

      if (vitalsRaw) {
        try {
          const v = JSON.parse(vitalsRaw);
          parsedVitals = {
            blood_pressure_sys: Number(v.blood_pressure_sys) || 120,
            blood_pressure_dia: Number(v.blood_pressure_dia) || 80,
            pulse_rate: Number(v.pulse_rate) || 80,
            spo2: Number(v.spo2) || 98,
            respiratory_rate: Number(v.respiratory_rate) || 16,
            gcs_score: Number(v.gcs_score) || 15,
            temperature_c: Number(v.temperature_c) || 37.0,
          };
        } catch (e) {
          console.debug("FormData vitals parse fallback:", e);
        }
      }
    } else {
      try {
        const body = await req.json();
        notes = body.notes || "";
        imageBase64 = body.imageBase64 || null;
        explicitApiKey = body.apiKey || null;

        if (body.vitals) {
          const v = typeof body.vitals === "string" ? JSON.parse(body.vitals) : body.vitals;
          parsedVitals = {
            blood_pressure_sys: Number(v.blood_pressure_sys) || 120,
            blood_pressure_dia: Number(v.blood_pressure_dia) || 80,
            pulse_rate: Number(v.pulse_rate) || 80,
            spo2: Number(v.spo2) || 98,
            respiratory_rate: Number(v.respiratory_rate) || 16,
            gcs_score: Number(v.gcs_score) || 15,
            temperature_c: Number(v.temperature_c) || 37.0,
          };
        }
      } catch (e) {
        console.debug("JSON body parse fallback:", e);
      }
    }

    const apiKey =
      explicitApiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      "";

    // If a valid API key is present, execute multimodal Gemini 1.5 Flash
    if (apiKey && apiKey !== "your_gemini_api_key_here") {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const contents: any[] = [];

        // Attach injury image if provided
        if (imageFile) {
          const arrayBuffer = await imageFile.arrayBuffer();
          const base64Data = Buffer.from(arrayBuffer).toString("base64");
          contents.push({
            inlineData: {
              mimeType: imageFile.type || "image/jpeg",
              data: base64Data,
            },
          });
        } else if (imageBase64) {
          const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
          contents.push({
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64,
            },
          });
        }

        // System prompt requesting structured SBAR report format
        const prompt = `
You are a medical triage assistant in India. Analyze the provided injury image (if attached), manual vitals, and paramedic notes (which may be in Hindi, Marathi, or Hinglish).

Manual Vitals Provided by User: ${JSON.stringify(parsedVitals)}
Paramedic Notes (Local Language/English): ${notes}

Instructions:
1. Translate any regional language notes to English internally.
2. Output strictly valid JSON matching this exact structure:
{
  "trauma_score": number (1.0 to 10.0),
  "urgency": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "sbar": {
    "situation": "Brief 1-sentence situation summary",
    "background": "Observed background/mechanism of injury",
    "assessment": "Clinical assessment based on image & vitals",
    "recommendation": "Actionable ER prep (e.g. pre-fetch blood, prepare CT scan)"
  },
  "required_specialists": ["Trauma Surgeon", "Orthopedic"]
}
`;

        contents.push(prompt);

        const response = await model.generateContent(contents);
        const textResponse = response.response.text();

        // Clean potential markdown formatting from JSON
        const cleanedJson = textResponse.replace(/```json|```/g, "").trim();
        const resultJson = JSON.parse(cleanedJson);

        return NextResponse.json({
          success: true,
          data: {
            ...resultJson,
            ai_source: "gemini-1.5-flash",
          },
        });
      } catch (geminiError: any) {
        console.warn("Live Gemini API call failed, using clinical SBAR engine:", geminiError?.message);
        const fallbackResult = generateDeterministicSbarTriage(parsedVitals, notes);
        return NextResponse.json({
          success: true,
          data: {
            trauma_score: fallbackResult.trauma_score,
            urgency: fallbackResult.urgency,
            sbar: fallbackResult.sbar,
            required_specialists: fallbackResult.required_specialists,
            ai_source: "clinical_engine_fallback",
            note: "Clinical SBAR engine used (Gemini API returned: " + geminiError?.message + ")",
          },
        });
      }
    }

    // Clinical SBAR fallback engine if no API key provided
    const fallbackResult = generateDeterministicSbarTriage(parsedVitals, notes);
    return NextResponse.json({
      success: true,
      data: {
        trauma_score: fallbackResult.trauma_score,
        urgency: fallbackResult.urgency,
        sbar: fallbackResult.sbar,
        required_specialists: fallbackResult.required_specialists,
        ai_source: "clinical_engine_fallback",
      },
    });
  } catch (error: any) {
    console.error("Gemini API Route Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process AI triage" },
      { status: 500 }
    );
  }
}

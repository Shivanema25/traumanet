import { NextRequest, NextResponse } from "next/server";
import { transcribeRegionalAudio } from "@/services/speech";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { audioBase64, languageHint } = body;

    if (!audioBase64) {
      return NextResponse.json({ error: "audioBase64 is required" }, { status: 400 });
    }

    const result = await transcribeRegionalAudio(audioBase64, languageHint);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("API /api/speech/transcribe error:", err);
    return NextResponse.json({ error: err.message || "Transcription failed" }, { status: 500 });
  }
}

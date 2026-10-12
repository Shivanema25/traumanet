import { NextRequest, NextResponse } from "next/server";
import { generateSBARHandover } from "@/services/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vitals, notes, imageBase64 } = body;

    if (!vitals) {
      return NextResponse.json({ error: "Patient vitals are required" }, { status: 400 });
    }

    const report = await generateSBARHandover(vitals, notes, imageBase64);
    return NextResponse.json(report);
  } catch (err: any) {
    console.error("API /api/ai/sbar error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate SBAR report" }, { status: 500 });
  }
}

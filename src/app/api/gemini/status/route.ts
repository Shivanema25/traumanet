import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const queryKey = url.searchParams.get("key");

  const apiKey =
    queryKey ||
    process.env.GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    "";

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return NextResponse.json({
      connected: false,
      reason: "MISSING_KEY",
      message: "No Gemini API key configured. Provide an API key in .env.local or via UI.",
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Reply with 'OK'");
    const text = result.response.text();

    return NextResponse.json({
      connected: true,
      model: "gemini-1.5-flash",
      message: "Gemini 1.5 Flash is active and fully linked with TraumaNet!",
      sampleOutput: text.trim(),
    });
  } catch (err: any) {
    const errorMsg = err?.message || String(err);

    // Extract project activation link if present
    const isServiceDisabled = errorMsg.includes("403") || errorMsg.includes("disabled") || errorMsg.includes("SERVICE_DISABLED");

    return NextResponse.json({
      connected: false,
      reason: isServiceDisabled ? "SERVICE_DISABLED" : "API_ERROR",
      message: errorMsg,
      activationUrl: isServiceDisabled
        ? "https://console.developers.google.com/apis/api/generativelanguage.googleapis.com/overview?project=119510150074"
        : undefined,
      studioUrl: "https://aistudio.google.com/app/apikey",
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { apiKey } = body;

    const keyToTest =
      apiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      "";

    if (!keyToTest) {
      return NextResponse.json({
        connected: false,
        reason: "MISSING_KEY",
        message: "No API key provided.",
      });
    }

    const genAI = new GoogleGenerativeAI(keyToTest);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Reply with 'OK'");

    return NextResponse.json({
      connected: true,
      model: "gemini-1.5-flash",
      message: "Gemini 1.5 Flash is verified and linked!",
      output: result.response.text().trim(),
    });
  } catch (err: any) {
    return NextResponse.json({
      connected: false,
      message: err?.message || "Verification failed",
    });
  }
}
